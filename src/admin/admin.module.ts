import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from 'src/users/entities/user.entity';
import { LawyerProfile } from 'src/lawyer-profiles/entities/lawyer-profile.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Document } from 'src/documents/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      LawyerProfile,
      Appointment,
      Review,
      Document,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
