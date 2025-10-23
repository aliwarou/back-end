import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsultationDto {
  @ApiProperty({
    description: 'ID du rendez-vous',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  appointmentId: number;
}
