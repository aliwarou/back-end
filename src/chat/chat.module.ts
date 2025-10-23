import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MessagesModule,
    ConversationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [ChatGateway, WsJwtGuard],
  exports: [ChatGateway],
})
export class ChatModule {}
