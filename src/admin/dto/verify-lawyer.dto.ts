import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class VerifyLawyerDto {
  @IsBoolean()
  isVerified: boolean;

  @IsBoolean()
  kycVerified: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
