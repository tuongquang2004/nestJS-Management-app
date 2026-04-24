import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class CommentResponseDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
