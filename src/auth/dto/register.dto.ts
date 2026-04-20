import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @ApiProperty({
    example: 'StrongPass@123',
    description: 'Please confirm your password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;
}
