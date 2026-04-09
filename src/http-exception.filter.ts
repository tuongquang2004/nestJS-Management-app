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

    const logMessage = `[${request.method}] ${request.url} - Status: ${status}`;
    let errorDetail = exception;
    if (exception instanceof Error) {
      errorDetail = exception.stack;
    }
    this.logger.error(logMessage, errorDetail);

    response.status(status).json({
      Time: new Date().toISOString(),
      Path: request.url,
      statusCode: status,
    });
  }
}
