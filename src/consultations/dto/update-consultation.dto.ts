import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class UpdateConsultationDto {
  @IsString()
  @IsOptional()
  clientNotes?: string;

  @IsString()
  @IsOptional()
  lawyerNotes?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  documentsShared?: number[];
}
