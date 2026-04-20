import { ApiPropertyOptional } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description:
      'The number of items to skip before starting to collect the result set',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({
    description: 'The number of items to return',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(1)
  limit?: number;
}
