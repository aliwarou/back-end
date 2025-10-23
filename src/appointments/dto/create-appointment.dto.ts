import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @IsNotEmpty()
  lawyerProfileId: number;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: Date;

  @IsInt()
  @Min(15)
  @IsOptional()
  durationMinutes?: number;

  @IsString()
  @IsOptional()
  clientNotes?: string;
}
