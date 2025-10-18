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
  
    // Relation One-to-One avec l'entité User. C'est le lien crucial.
    @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' }) // eager: charge l'utilisateur automatiquement
    @JoinColumn()
    user: User;
  
    @Column()
    userId: number; // Clé étrangère explicite
  
    @Column({ length: 255 })
    specialization: string;
  
    @Column('text')
    bio: string;
  
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    hourlyRate: number;
  
    @Column({ default: false })
    isVerified: boolean; // Un admin pourra mettre ce champ à `true` plus tard
  
    @Column({ nullable: true })
    officeAddress: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  