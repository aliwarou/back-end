import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilitiesService } from './availabilities.service';
import { AvailabilitiesController } from './availabilities.controller';
import { Availability } from './entities/availability.entity';
import { LawyerProfile } from 'src/lawyer-profiles/entities/lawyer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, LawyerProfile])],
  controllers: [AvailabilitiesController],
  providers: [AvailabilitiesService],
  exports: [AvailabilitiesService],
})
export class AvailabilitiesModule {}
