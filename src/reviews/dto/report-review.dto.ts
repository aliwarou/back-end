import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportReviewDto {
  @ApiProperty({
    description: 'Raison du signalement',
    example: 'Contenu inapproprié ou diffamatoire',
  })
  @IsString()
  @IsNotEmpty()
  reportReason: string;
}
