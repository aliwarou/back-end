import { IsString, IsNotEmpty } from 'class-validator';

export class RespondReviewDto {
  @IsString()
  @IsNotEmpty()
  lawyerResponse: string;
}
