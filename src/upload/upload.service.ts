import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UploadService {
  handleFileUpload(file: Express.Multer.File): {
    message: string;
    filename: string;
  } {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
    };
  }
}
