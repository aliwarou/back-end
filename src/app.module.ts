import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IamModule } from './iam/iam.module';
import { ConfigModule } from '@nestjs/config';
import { LawerprofilesModule } from './lawerprofiles/lawerprofiles.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: +process.env.DB_PORT,
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    IamModule,
    LawerprofilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
