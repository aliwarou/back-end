import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { ConversationsService } from 'src/conversations/conversations.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly conversationsService: ConversationsService,
  ) {}

  async create(
    createDto: CreateMessageDto,
    activeUser: ActiveUserData,
  ): Promise<Message> {
    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await this.conversationRepository.findOneBy({
      id: createDto.conversationId,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée.');
    }

    if (
      conversation.clientId !== activeUser.sub &&
      conversation.lawyerId !== activeUser.sub
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à envoyer des messages dans cette conversation.",
      );
    }

    const message = this.messageRepository.create({
      ...createDto,
      senderId: activeUser.sub,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Mettre à jour le dernier message de la conversation
    await this.conversationsService.updateLastMessage(
      createDto.conversationId,
      createDto.content,
      activeUser.sub,
    );

    return savedMessage;
  }

  async findByConversation(
    conversationId: number,
    activeUser: ActiveUserData,
  ): Promise<Message[]> {
    // Vérifier l'accès à la conversation
    await this.conversationsService.findOne(conversationId, activeUser);

    return this.messageRepository.find({
      where: { conversationId, isDeleted: false },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number, activeUser: ActiveUserData): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: { conversation: true },
    });

    if (!message) {
      throw new NotFoundException(`Message avec l'ID "${id}" non trouvé.`);
    }

    // Vérifier l'accès
    if (
      message.conversation.clientId !== activeUser.sub &&
      message.conversation.lawyerId !== activeUser.sub
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à accéder à ce message.",
      );
    }

    return message;
  }

  async markAsRead(id: number, activeUser: ActiveUserData): Promise<Message> {
    const message = await this.findOne(id, activeUser);

    // Seul le destinataire peut marquer comme lu
    if (message.senderId === activeUser.sub) {
      return message; // L'expéditeur ne peut pas marquer son propre message
    }

    message.isRead = true;
    message.readAt = new Date();

    return this.messageRepository.save(message);
  }

  async remove(id: number, activeUser: ActiveUserData): Promise<void> {
    const message = await this.findOne(id, activeUser);

    // Seul l'expéditeur peut supprimer son message
    if (message.senderId !== activeUser.sub) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres messages.',
      );
    }

    message.isDeleted = true;
    message.deletedAt = new Date();

    await this.messageRepository.save(message);
  }
}
