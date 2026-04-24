import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class PostResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
