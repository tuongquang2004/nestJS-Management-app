import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class TransferPostDto {
  @ApiProperty({
    description: 'ID of the user who will receive the post',
    example: 2,
  })
  @IsInt({ message: 'ID of the receiver must be an integer' })
  @Min(1)
  receiverId: number;
}
