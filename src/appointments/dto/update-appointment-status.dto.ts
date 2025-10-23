import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'Nouveau statut du rendez-vous',
    enum: AppointmentStatus,
    example: AppointmentStatus.ACCEPTED,
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Raison du rejet (si statut = REJECTED)',
    example: 'Non disponible à cette date',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: "Raison de l'annulation (si statut = CANCELLED)",
    example: 'Empêchement de dernière minute',
  })
  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @ApiPropertyOptional({
    description: 'Notes du juriste',
    example: 'Client très courtois',
  })
  @IsString()
  @IsOptional()
  lawyerNotes?: string;
}
