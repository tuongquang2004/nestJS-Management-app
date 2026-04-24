import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'rocky_2004',
    description: 'The username of the user',
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty({
    example: 'StrongPass@123',
    description: 'The password of the user',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'password must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  password: string;

  @ApiProperty({
    example: 'rocky2004@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
