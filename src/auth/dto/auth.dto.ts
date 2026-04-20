import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    description: 'username',
    example: 'rocky_2004',
  })
  @IsString()
  @IsNotEmpty({ message: 'username required' })
  username: string;

  @ApiProperty({
    description:
      'password must contain at least 1 uppercase letter, 1 number, and 1 special character',
    example: 'StrongPass@123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'password required' })
  @MinLength(6, { message: 'password must be at least 6 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'password must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  password: string;
}
