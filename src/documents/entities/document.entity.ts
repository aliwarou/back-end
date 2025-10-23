import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { DocumentType } from '../enums/document-type.enum';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @Column()
  ownerId: number;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  type: DocumentType;

  @Column({ nullable: true })
  hash: string; // SHA-256 hash du fichier

  @Column({ default: false })
  isEncrypted: boolean;

  @Column({ nullable: true })
  encryptionKey: string;

  @Column('simple-array', { nullable: true })
  accessibleBy: number[]; // Liste des user IDs ayant accès

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  relatedEntityType: string; // 'appointment', 'message', 'profile', etc.

  @Column({ nullable: true })
  relatedEntityId: number;

  @CreateDateColumn()
  createdAt: Date;
}
