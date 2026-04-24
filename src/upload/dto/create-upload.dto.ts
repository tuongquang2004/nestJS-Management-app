import { ApiProperty } from '@nestjs/swagger';

export class CreateUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Format needed (jpg, jpeg, png...)',
  })
  file: any;
}
