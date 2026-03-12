import {
  Controller,
  Post,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from 'src/auth/guards/auth.guard';

export const avatarStorage = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};

export const postImageStorage = {
  storage: diskStorage({
    destination: './uploads/post-images',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', avatarStorage))
  uploadAvatar(
    @UploadedFile() file,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const userId = req['user'].userID;
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
    };
  }

  @UseGuards(AuthGuard)
  @Post('post-image')
  @UseInterceptors(FileInterceptor('file', postImageStorage))
  uploadPostImage(
    @UploadedFile() file,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const userId = req['user'].userID;
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
    };
  }
}
