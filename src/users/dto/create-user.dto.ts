import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Obama', description: 'The username of the user' })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty({
    example: 'secret123',
    description: 'The password of the user',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(2, { message: 'Password must be at least 2 characters long' })
  password: string;

  @ApiProperty({
    example: 'obama@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class CreateUserResponseDto {
  @ApiProperty()
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty()
  @IsString({ message: 'Password must be a string' })
  @MinLength(2, { message: 'Password must be at least 2 characters long' })
  password: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
