import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

export class PostResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  @ApiProperty({ example: 5, description: 'Number of comments' })
  @Expose()
  commentCount?: number;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
