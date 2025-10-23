import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('lawyer_profiles')
export class LawyerProfile {
  @PrimaryGeneratedColumn()
  id: number;

  // Relation One-to-One avec l'entité User
  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @Column({ length: 255 })
  specialization: string;

  @Column('text')
  bio: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  officeAddress: string;

  @Column('simple-array', { nullable: true })
  languages: string[];

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  barAssociation: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ type: 'int', default: 0 })
  yearsOfExperience: number;

  // Documents KYC
  @Column({ nullable: true })
  idDocumentUrl: string;

  @Column({ nullable: true })
  licenseDocumentUrl: string;

  @Column({ nullable: true })
  proofOfAddressUrl: string;

  @Column({ default: false })
  kycVerified: boolean;

  @Column({ nullable: true })
  kycVerifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: number; // Admin user ID

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ default: true })
  isAvailableForConsultation: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
