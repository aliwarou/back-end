import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class ModerateReviewDto {
  @IsBoolean()
  isPublished: boolean;

  @IsString()
  @IsOptional()
  moderationNotes?: string;
}
