import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: 'ID de la conversation',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  conversationId: number;

  @ApiProperty({
    description: 'Contenu du message',
    example: 'Bonjour, je souhaite prendre rendez-vous pour...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'URLs des pièces jointes',
    example: ['https://example.com/document.pdf'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
