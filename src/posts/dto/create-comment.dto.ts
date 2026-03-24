import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(500, {
    message: 'Comment is too long, maximum length is 500 characters',
  })
  content: string;
}
