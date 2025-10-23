import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class SuspendUserDto {
  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}
