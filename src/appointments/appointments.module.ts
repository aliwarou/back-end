import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { LawyerProfilesModule } from 'src/lawyer-profiles/lawyer-profiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), LawyerProfilesModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
