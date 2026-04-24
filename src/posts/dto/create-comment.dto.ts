import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This article is very helpful, thank you!',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(500, {
    message: 'Comment is too long, maximum length is 500 characters',
  })
  content: string;
}
