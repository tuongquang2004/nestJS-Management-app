import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const customFileName = (req: any, file: Express.Multer.File, cb: any) => {
  const filename: string =
    path.parse(file.originalname).name.replace(/\s/g, '') + '-' + uuidv4();
  const extension: string = path.parse(file.originalname).ext;
  cb(null, `${filename}${extension}`);
};

export const avatarStorage = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: customFileName,
  }),
};

export const postImageStorage = {
  storage: diskStorage({
    destination: './uploads/post-images',
    filename: customFileName,
  }),
};
