import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Title of the post',
    example: 'Tutorial on NestJS DTOs',
    maxLength: 150,
  })
  @IsString({ message: 'Title has to be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(150, {
    message: 'Title is too long, maximum length is 150 characters',
  })
  title: string;

  @ApiProperty({
    description: 'Content of the post',
    example:
      'NestJS is a great framework for building scalable Node.js applications',
    minLength: 10,
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MinLength(10, {
    message: 'Content is too short, minimum length is 10 characters',
  })
  content: string;
}
