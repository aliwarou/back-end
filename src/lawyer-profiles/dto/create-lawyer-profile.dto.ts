import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  MaxLength,
  IsArray,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLawyerProfileDto {
  @ApiProperty({
    description: 'Spécialisation du juriste',
    example: 'Droit des affaires',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  specialization: string;

  @ApiProperty({
    description: 'Biographie et présentation du juriste',
    example:
      "Avocat spécialisé en droit des affaires avec 10 ans d'expérience...",
  })
  @IsString()
  @IsNotEmpty()
  bio: string;

  @ApiPropertyOptional({
    description: 'Tarif horaire en euros',
    example: 150.0,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional({
    description: 'Adresse du cabinet',
    example: '123 Rue de la Loi, Paris',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  officeAddress?: string;

  @ApiPropertyOptional({
    description: 'Langues parlées',
    example: ['Français', 'Anglais', 'Espagnol'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @ApiPropertyOptional({
    description: 'Ville',
    example: 'Paris',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Pays',
    example: 'France',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: "Barreau d'inscription",
    example: 'Barreau de Paris',
  })
  @IsString()
  @IsOptional()
  barAssociation?: string;

  @ApiPropertyOptional({
    description: 'Numéro de licence',
    example: 'P12345',
  })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional({
    description: "Années d'expérience",
    example: 10,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number;
}
