import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, MaxLength } from 'class-validator';

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
}

