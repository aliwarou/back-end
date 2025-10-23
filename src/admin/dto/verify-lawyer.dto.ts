import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyLawyerDto {
  @ApiProperty({
    description: 'Vérifier ou non le profil du juriste',
    example: true,
  })
  @IsBoolean()
  isVerified: boolean;

  @ApiProperty({
    description: 'Vérifier ou non le KYC du juriste',
    example: true,
  })
  @IsBoolean()
  kycVerified: boolean;

  @ApiPropertyOptional({
    description: 'Notes de vérification',
    example: 'Documents valides, diplômes vérifiés',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
