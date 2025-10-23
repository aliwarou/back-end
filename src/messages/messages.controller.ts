import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Auth(AuthType.Bearer)
  @Post()
  create(
    @Body() createDto: CreateMessageDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.messagesService.create(createDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get()
  findByConversation(
    @Query('conversationId', ParseIntPipe) conversationId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.messagesService.findByConversation(conversationId, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.messagesService.findOne(id, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id/mark-as-read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.messagesService.markAsRead(id, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.messagesService.remove(id, activeUser);
  }
}
