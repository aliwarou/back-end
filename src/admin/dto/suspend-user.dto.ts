import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuspendUserDto {
  @ApiProperty({
    description: "Activer ou suspendre l'utilisateur",
    example: false,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Raison de la suspension',
    example: 'Comportement inapproprié signalé',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
