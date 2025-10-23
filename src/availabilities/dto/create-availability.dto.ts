import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Date de disponibilité',
    example: '2025-10-25',
  })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: 'Heure de début (format HH:mm)',
    example: '09:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({
    description: 'Heure de fin (format HH:mm)',
    example: '17:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Disponible ou non',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description: "Raison de l'indisponibilité",
    example: 'Réunion importante',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
