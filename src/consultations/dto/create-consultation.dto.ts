import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateConsultationDto {
  @IsInt()
  @IsNotEmpty()
  appointmentId: number;
}
