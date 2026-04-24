import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class UserQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'search keyword (by username or email)',
    example: 'rocky_balboa',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Precise filtering by permission (role)',
    enum: ['admin', 'user'],
    example: 'user',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Column name to sort by (e.g., id, username, createdAt)',
    enum: ['id', 'username', 'email', 'createdAt'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order (Ascending or Descending)',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
