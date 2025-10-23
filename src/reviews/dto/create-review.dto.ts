import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID du profil du juriste',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  lawyerProfileId: number;

  @ApiPropertyOptional({
    description: 'ID du rendez-vous associé',
    example: 5,
  })
  @IsInt()
  @IsOptional()
  appointmentId?: number;

  @ApiProperty({
    description: 'Note de 1 à 5 étoiles',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiPropertyOptional({
    description: "Commentaire de l'avis",
    example: "Excellent juriste, très professionnel et à l'écoute.",
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
