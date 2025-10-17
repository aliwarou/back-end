import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HashingService } from 'src/users/hashing/hashing.service';
import { BcryptService } from 'src/users/hashing/bcrypt.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: HashingService, useClass: BcryptService },
  ],
  exports: [UsersService, HashingService],
})
export class UsersModule {}
