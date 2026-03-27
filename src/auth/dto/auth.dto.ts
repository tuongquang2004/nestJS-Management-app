import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty({ message: 'username required' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'password required' })
  @MinLength(2, { message: 'password must be at least 2 characters' })
  password: string;
}
