import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards';
import { avatarStorage, postImageStorage } from './configs/multer.config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUploadDto } from './dto/create-upload.dto';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AuthGuard)
  @Post('avatar')
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Choose an image file to upload as avatar',
    type: CreateUploadDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Upload avatar successfully',
    schema: {
      example: {
        message: 'File uploaded successfully',
        filename: 'avatar-1704028392.jpg',
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', avatarStorage))
  uploadAvatar(@UploadedFile() file: Express.Multer.File): {
    message: string;
    filename: string;
  } {
    return this.uploadService.handleFileUpload(file);
  }

  @UseGuards(AuthGuard)
  @Post('post-image')
  @ApiOperation({ summary: 'Upload post image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Choose an image file to upload as post image',
    type: CreateUploadDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Upload post image successfully',
    schema: {
      example: {
        message: 'File uploaded successfully',
        filename: 'post-image-1704028455.png',
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', postImageStorage))
  uploadPostImage(@UploadedFile() file: Express.Multer.File): {
    message: string;
    filename: string;
  } {
    return this.uploadService.handleFileUpload(file);
  }
}
