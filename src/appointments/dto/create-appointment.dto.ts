import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID du profil du juriste',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  lawyerProfileId: number;

  @ApiProperty({
    description: 'Date et heure du rendez-vous',
    example: '2025-10-25T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: Date;

  @ApiPropertyOptional({
    description: 'Durée en minutes (minimum 15)',
    example: 60,
    minimum: 15,
  })
  @IsInt()
  @Min(15)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Notes du client pour le juriste',
    example: "Je souhaite discuter d'un contrat de travail",
  })
  @IsString()
  @IsOptional()
  clientNotes?: string;
}
