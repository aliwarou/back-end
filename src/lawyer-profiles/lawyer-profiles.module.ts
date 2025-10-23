import { Module } from '@nestjs/common';
import { LawyerProfileService } from './lawyer-profiles.service';
import { LawyerProfileController } from './lawyer-profiles.controller';
import { LawyerProfile } from './entities/lawyer-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([LawyerProfile])],
  controllers: [LawyerProfileController],
  providers: [LawyerProfileService],
  exports: [LawyerProfileService],
})
export class LawyerProfilesModule {}
