import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchLawyerDto {
  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minRate?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxRate?: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  minRating?: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minExperience?: number;

  @IsString()
  @IsOptional()
  sortBy?: 'rating' | 'rate' | 'experience' | 'reviews';

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
