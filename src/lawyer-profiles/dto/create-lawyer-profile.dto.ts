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

export class CreateLawyerProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  specialization: string;

  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  officeAddress?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  barAssociation?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number;
}
