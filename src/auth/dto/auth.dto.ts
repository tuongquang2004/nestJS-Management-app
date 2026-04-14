import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty({ message: 'username required' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'password required' })
  @MinLength(6, { message: 'password must be at least 6 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'password must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  password: string;
}
