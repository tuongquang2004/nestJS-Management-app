import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let exceptionResponse: any;
    if (exception instanceof HttpException) {
      exceptionResponse = exception.getResponse();
    }

    const message =
      exceptionResponse?.message ||
      (exception instanceof Error
        ? exception.message
        : 'Internal server error');

    const errorType =
      exceptionResponse?.error ||
      (status === (HttpStatus.INTERNAL_SERVER_ERROR as number)
        ? 'Internal Server Error'
        : 'Error');

    const logMessage = `[${request.method}] ${request.url} - Status: ${status}`;
    if (status >= (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : exception,
      );
    } else {
      this.logger.warn(logMessage, JSON.stringify(message));
    }

    response.status(status).json({
      statusCode: status,
      error: errorType,
      message: message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
