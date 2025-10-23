import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsInt()
  @IsNotEmpty()
  fileSize: number;

  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @IsBoolean()
  @IsOptional()
  isEncrypted?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  accessibleBy?: number[];

  @IsString()
  @IsOptional()
  relatedEntityType?: string;

  @IsInt()
  @IsOptional()
  relatedEntityId?: number;
}
