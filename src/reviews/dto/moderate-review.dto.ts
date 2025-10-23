import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ModerateReviewDto {
  @ApiProperty({
    description: "Publier ou dépublier l'avis",
    example: true,
  })
  @IsBoolean()
  isPublished: boolean;

  @ApiPropertyOptional({
    description: 'Notes de modération (admin uniquement)',
    example: 'Avis validé après vérification',
  })
  @IsString()
  @IsOptional()
  moderationNotes?: string;
}
