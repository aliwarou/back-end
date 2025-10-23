import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { LawyerProfile } from 'src/lawyer-profiles/entities/lawyer-profile.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  client: User;

  @Column()
  clientId: number;

  @ManyToOne(() => LawyerProfile, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  lawyerProfile: LawyerProfile;

  @Column()
  lawyerProfileId: number;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'int', default: 60 })
  durationMinutes: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column('text', { nullable: true })
  clientNotes: string;

  @Column('text', { nullable: true })
  lawyerNotes: string;

  @Column({ nullable: true })
  consultationLink: string; // Lien Jitsi ou autre

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  cancelledBy: number; // User ID

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paymentId: string; // Stripe Payment Intent ID

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
