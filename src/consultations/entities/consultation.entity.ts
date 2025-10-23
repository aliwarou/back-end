import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Entity('consultations')
export class Consultation {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Appointment, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  appointment: Appointment;

  @Column()
  appointmentId: number;

  @Column({ nullable: true })
  videoRoomId: string; // Jitsi room ID

  @Column({ nullable: true })
  videoLink: string;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column('text', { nullable: true })
  clientNotes: string;

  @Column('text', { nullable: true })
  lawyerNotes: string;

  @Column('simple-array', { nullable: true })
  documentsShared: string[]; // Document IDs

  @Column({ default: false })
  isRecorded: boolean;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
