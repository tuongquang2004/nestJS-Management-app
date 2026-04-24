import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PostSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PostQueryDto {
  @IsOptional()
  @IsString()
  search: string = '';

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(PostSortOrder)
  sortOrder?: PostSortOrder = PostSortOrder.DESC;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  limit: number = 10;
}
