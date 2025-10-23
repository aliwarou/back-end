import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { Consultation } from './entities/consultation.entity';
import { AppointmentsModule } from 'src/appointments/appointments.module';
import { LawyerProfilesModule } from 'src/lawyer-profiles/lawyer-profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consultation]),
    AppointmentsModule,
    LawyerProfilesModule,
  ],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
