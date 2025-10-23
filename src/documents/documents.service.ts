import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UploadUrlDto } from './dto/upload-url.dto';
import { Document } from './entities/document.entity';
import { S3Service } from './services/s3.service';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import * as crypto from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly s3Service: S3Service,
  ) {}

  async getUploadUrl(
    createDto: CreateDocumentDto,
    activeUser: ActiveUserData,
  ): Promise<UploadUrlDto> {
    const fileKey = this.s3Service.generateFileKey(
      activeUser.sub,
      createDto.fileName,
    );

    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
      fileKey,
      createDto.mimeType,
    );

    // Créer un enregistrement en base de données
    const document = this.documentRepository.create({
      ...createDto,
      ownerId: activeUser.sub,
      fileUrl: this.s3Service.getPublicUrl(fileKey),
      hash: this.generateHash(fileKey),
    });

    await this.documentRepository.save(document);

    return {
      uploadUrl,
      fileKey,
      expiresIn: 3600,
    };
  }

  async findAll(activeUser: ActiveUserData): Promise<Document[]> {
    if (activeUser.role === RoleEnum.Admin) {
      return this.documentRepository.find({
        relations: { owner: true },
        order: { createdAt: 'DESC' },
      });
    }

    // Utilisateurs normaux ne voient que leurs documents
    return this.documentRepository.find({
      where: { ownerId: activeUser.sub },
      order: { createdAt: 'DESC' },
    });
  }

  async findMyDocuments(activeUser: ActiveUserData): Promise<Document[]> {
    return this.documentRepository.find({
      where: { ownerId: activeUser.sub },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, activeUser: ActiveUserData): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID "${id}" non trouvé.`);
    }

    // Vérifier les permissions
    this.checkAccess(document, activeUser);

    return document;
  }

  async getDownloadUrl(
    id: number,
    activeUser: ActiveUserData,
  ): Promise<{ downloadUrl: string }> {
    const document = await this.findOne(id, activeUser);

    // Extraire la clé S3 de l'URL
    const fileKey = this.extractS3Key(document.fileUrl);

    const downloadUrl =
      await this.s3Service.generatePresignedDownloadUrl(fileKey);

    return { downloadUrl };
  }

  async remove(id: number, activeUser: ActiveUserData): Promise<void> {
    const document = await this.findOne(id, activeUser);

    // Seul le propriétaire ou un admin peut supprimer
    if (
      document.ownerId !== activeUser.sub &&
      activeUser.role !== RoleEnum.Admin
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer ce document.",
      );
    }

    // Supprimer le fichier de S3
    const fileKey = this.extractS3Key(document.fileUrl);
    await this.s3Service.deleteFile(fileKey);

    // Supprimer l'enregistrement en base
    await this.documentRepository.remove(document);
  }

  async grantAccess(
    id: number,
    userId: number,
    activeUser: ActiveUserData,
  ): Promise<Document> {
    const document = await this.findOne(id, activeUser);

    // Seul le propriétaire peut accorder l'accès
    if (document.ownerId !== activeUser.sub) {
      throw new ForbiddenException(
        "Seul le propriétaire peut accorder l'accès.",
      );
    }

    if (!document.accessibleBy) {
      document.accessibleBy = [];
    }

    if (!document.accessibleBy.includes(userId)) {
      document.accessibleBy.push(userId);
    }

    return this.documentRepository.save(document);
  }

  async revokeAccess(
    id: number,
    userId: number,
    activeUser: ActiveUserData,
  ): Promise<Document> {
    const document = await this.findOne(id, activeUser);

    if (document.ownerId !== activeUser.sub) {
      throw new ForbiddenException(
        "Seul le propriétaire peut révoquer l'accès.",
      );
    }

    if (document.accessibleBy) {
      document.accessibleBy = document.accessibleBy.filter(
        (id) => id !== userId,
      );
    }

    return this.documentRepository.save(document);
  }

  private checkAccess(document: Document, activeUser: ActiveUserData): void {
    // Admin a accès à tout
    if (activeUser.role === RoleEnum.Admin) {
      return;
    }

    // Document public
    if (document.isPublic) {
      return;
    }

    // Propriétaire
    if (document.ownerId === activeUser.sub) {
      return;
    }

    // Dans la liste d'accès
    if (
      document.accessibleBy &&
      document.accessibleBy.includes(activeUser.sub)
    ) {
      return;
    }

    throw new ForbiddenException(
      "Vous n'êtes pas autorisé à accéder à ce document.",
    );
  }

  private extractS3Key(fileUrl: string): string {
    // Extraire la clé S3 de l'URL complète
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    // Retirer le nom du bucket si présent
    return pathParts.slice(pathParts.indexOf('users')).join('/');
  }

  private generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
