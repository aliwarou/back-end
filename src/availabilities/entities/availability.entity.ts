import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LawyerProfile } from 'src/lawyer-profiles/entities/lawyer-profile.entity';

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LawyerProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  lawyerProfile: LawyerProfile;

  @Column()
  lawyerProfileId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  reason: string; // Pour expliquer une indisponibilité

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
