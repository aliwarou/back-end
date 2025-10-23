import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondReviewDto {
  @ApiProperty({
    description: "Réponse du juriste à l'avis",
    example:
      'Merci pour votre retour positif ! Ce fut un plaisir de vous accompagner.',
  })
  @IsString()
  @IsNotEmpty()
  lawyerResponse: string;
}
