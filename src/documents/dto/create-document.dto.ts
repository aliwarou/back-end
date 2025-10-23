import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../enums/document-type.enum';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Nom du fichier',
    example: 'contrat_travail.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'Type MIME du fichier',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    description: 'Taille du fichier en octets',
    example: 1048576,
  })
  @IsInt()
  @IsNotEmpty()
  fileSize: number;

  @ApiPropertyOptional({
    description: 'Type de document',
    enum: DocumentType,
    example: DocumentType.CONTRACT,
  })
  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @ApiPropertyOptional({
    description: 'Document chiffré ou non',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isEncrypted?: boolean;

  @ApiPropertyOptional({
    description: 'Document public ou privé',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'IDs des utilisateurs ayant accès au document',
    example: [1, 5, 10],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  accessibleBy?: number[];

  @ApiPropertyOptional({
    description: "Type d'entité liée (appointment, consultation, etc.)",
    example: 'appointment',
  })
  @IsString()
  @IsOptional()
  relatedEntityType?: string;

  @ApiPropertyOptional({
    description: "ID de l'entité liée",
    example: 5,
  })
  @IsInt()
  @IsOptional()
  relatedEntityId?: number;
}
