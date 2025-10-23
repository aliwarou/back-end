import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { LawyerProfile } from 'src/lawyer-profiles/entities/lawyer-profile.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Entity('reviews')
export class Review {
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

  @OneToOne(() => Appointment, { nullable: true })
  @JoinColumn()
  appointment: Appointment;

  @Column({ nullable: true })
  appointmentId: number;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column('text', { nullable: true })
  comment: string;

  @Column('text', { nullable: true })
  lawyerResponse: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ default: false })
  isReported: boolean;

  @Column({ nullable: true })
  reportReason: string;

  @Column({ nullable: true })
  reportedBy: number; // User ID

  @Column({ nullable: true })
  reportedAt: Date;

  @Column({ default: false })
  isModerated: boolean;

  @Column({ nullable: true })
  moderatedBy: number; // Admin user ID

  @Column({ nullable: true })
  moderatedAt: Date;

  @Column({ nullable: true })
  moderationNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
