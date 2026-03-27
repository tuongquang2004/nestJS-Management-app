import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const customFileName = (req: any, file: Express.Multer.File, cb: any) => {
  const filename: string =
    path.parse(file.originalname).name.replace(/\s/g, '') + '-' + uuidv4();
  const extension: string = path.parse(file.originalname).ext;
  cb(null, `${filename}${extension}`);
};

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpg|jpeg|png)$/)) {
    return cb(new BadRequestException('only accept jpg, jpeg, png!'), false);
  }
  cb(null, true);
};

export const avatarStorage = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: customFileName,
  }),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
};

export const postImageStorage = {
  storage: diskStorage({
    destination: './uploads/post-images',
    filename: customFileName,
  }),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
};
