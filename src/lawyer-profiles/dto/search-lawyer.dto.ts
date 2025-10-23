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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchLawyerDto {
  @ApiPropertyOptional({
    description: 'Filtrer par spécialisation',
    example: 'Droit des affaires',
  })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par nom du juriste',
    example: 'Dupont',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par ville',
    example: 'Paris',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par pays',
    example: 'France',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par langues parlées',
    example: ['Français', 'Anglais'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @ApiPropertyOptional({
    description: 'Tarif horaire minimum',
    example: 50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minRate?: number;

  @ApiPropertyOptional({
    description: 'Tarif horaire maximum',
    example: 200,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxRate?: number;

  @ApiPropertyOptional({
    description: 'Note minimum (sur 5)',
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  minRating?: number;

  @ApiPropertyOptional({
    description: "Années d'expérience minimum",
    example: 5,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minExperience?: number;

  @ApiPropertyOptional({
    description: 'Trier par',
    enum: ['rating', 'rate', 'experience', 'reviews'],
    example: 'rating',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'rating' | 'rate' | 'experience' | 'reviews';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre de résultats par page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
