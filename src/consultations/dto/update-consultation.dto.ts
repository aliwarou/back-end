import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConsultationDto {
  @ApiPropertyOptional({
    description: 'Notes du client',
    example: 'Points importants discutés lors de la consultation',
  })
  @IsString()
  @IsOptional()
  clientNotes?: string;

  @ApiPropertyOptional({
    description: 'Notes du juriste',
    example: 'Conseils juridiques donnés, documents à fournir',
  })
  @IsString()
  @IsOptional()
  lawyerNotes?: string;

  @ApiPropertyOptional({
    description: 'IDs des documents partagés durant la consultation',
    example: [1, 5, 8],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  documentsShared?: number[];
}
