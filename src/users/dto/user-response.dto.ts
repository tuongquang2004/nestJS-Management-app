import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'unique ID of the user' })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'rocky_2004',
    description: 'The username of the user',
  })
  @Expose()
  username: string;

  @ApiProperty({
    example: 'rocky2004@example.com',
    description: 'The email of the user',
  })
  @Expose()
  email: string;

  @ApiProperty({ example: 'user', description: 'The role of the user' })
  @Expose()
  role: string;
}
