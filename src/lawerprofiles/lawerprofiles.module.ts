import { Module } from '@nestjs/common';
import { LawyerProfileService } from './lawerprofiles.service';
import { LawyerProfileController } from './lawerprofiles.controller';
import { LawyerProfile } from './entities/lawerprofile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[UsersModule, TypeOrmModule.forFeature([LawyerProfile])],
  controllers: [LawyerProfileController],
  providers: [LawyerProfileService],
})
export class LawerprofilesModule {}
