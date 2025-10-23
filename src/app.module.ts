import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IamModule } from './iam/iam.module';
import { ConfigModule } from '@nestjs/config';
import { LawyerProfilesModule } from './lawyer-profiles/lawyer-profiles.module';
import { AvailabilitiesModule } from './availabilities/availabilities.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { DocumentsModule } from './documents/documents.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';

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
    LawyerProfilesModule,
    AvailabilitiesModule,
    AppointmentsModule,
    ReviewsModule,
    ConversationsModule,
    MessagesModule,
    DocumentsModule,
    ConsultationsModule,
    AdminModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
