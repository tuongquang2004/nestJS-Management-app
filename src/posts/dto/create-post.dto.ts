import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Title has to be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(150, {
    message: 'Title is too long, maximum length is 150 characters',
  })
  title: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MinLength(10, {
    message: 'Content is too short, minimum length is 10 characters',
  })
  content: string;
}
