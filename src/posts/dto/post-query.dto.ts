import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PostQueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword for post title or content',
    example: 'NestJS',
  })
  @IsOptional()
  @IsString()
  search: string = '';

  @ApiPropertyOptional({
    description: 'Current page number (Default is page 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (Default is 10)',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  limit: number = 10;
}
