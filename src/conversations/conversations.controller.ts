import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Auth(AuthType.Bearer)
  @Post()
  create(
    @Body() createDto: CreateConversationDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.conversationsService.create(createDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get()
  findMyConversations(@ActiveUser() activeUser: ActiveUserData) {
    return this.conversationsService.findMyConversations(activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.conversationsService.findOne(id, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id/mark-as-read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.conversationsService.markAsRead(id, activeUser);
  }
}
