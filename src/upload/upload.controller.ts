import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { avatarStorage, postImageStorage } from './configs/multer.config';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', avatarStorage))
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.handleFileUpload(file);
  }

  @UseGuards(AuthGuard)
  @Post('post-image')
  @UseInterceptors(FileInterceptor('file', postImageStorage))
  uploadPostImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.handleFileUpload(file);
  }
}
