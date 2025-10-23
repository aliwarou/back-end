import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation } from './entities/conversation.entity';
import { UsersService } from 'src/users/users.service';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createDto: CreateConversationDto,
    activeUser: ActiveUserData,
  ): Promise<Conversation> {
    const participant = await this.usersService.findOne(
      createDto.participantId,
    );

    // Vérifier qu'on ne crée pas une conversation avec soi-même
    if (participant.id === activeUser.sub) {
      throw new ConflictException(
        'Vous ne pouvez pas créer une conversation avec vous-même.',
      );
    }

    // Vérifier si une conversation existe déjà
    const existingConversation = await this.conversationRepository.findOne({
      where: [
        { clientId: activeUser.sub, lawyerId: participant.id },
        { clientId: participant.id, lawyerId: activeUser.sub },
      ],
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Déterminer qui est client et qui est juriste
    const currentUser = await this.usersService.findOne(activeUser.sub);

    let clientId: number, lawyerId: number;

    if (currentUser.role === RoleEnum.Client) {
      if (participant.role !== RoleEnum.Juriste) {
        throw new ConflictException(
          "Un client ne peut discuter qu'avec un juriste.",
        );
      }
      clientId = currentUser.id;
      lawyerId = participant.id;
    } else if (currentUser.role === RoleEnum.Juriste) {
      if (participant.role !== RoleEnum.Client) {
        throw new ConflictException(
          "Un juriste ne peut discuter qu'avec un client.",
        );
      }
      clientId = participant.id;
      lawyerId = currentUser.id;
    } else {
      throw new ForbiddenException('Rôle non autorisé.');
    }

    const conversation = this.conversationRepository.create({
      clientId,
      lawyerId,
    });

    return this.conversationRepository.save(conversation);
  }

  async findMyConversations(
    activeUser: ActiveUserData,
  ): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: [{ clientId: activeUser.sub }, { lawyerId: activeUser.sub }],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async findOne(id: number, activeUser: ActiveUserData): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: { messages: true },
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation avec l'ID "${id}" non trouvée.`,
      );
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (
      conversation.clientId !== activeUser.sub &&
      conversation.lawyerId !== activeUser.sub
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à accéder à cette conversation.",
      );
    }

    return conversation;
  }

  async markAsRead(id: number, activeUser: ActiveUserData): Promise<void> {
    const conversation = await this.findOne(id, activeUser);

    if (conversation.clientId === activeUser.sub) {
      conversation.unreadCountClient = 0;
    } else if (conversation.lawyerId === activeUser.sub) {
      conversation.unreadCountLawyer = 0;
    }

    await this.conversationRepository.save(conversation);
  }

  async updateLastMessage(
    conversationId: number,
    messageText: string,
    senderId: number,
  ): Promise<void> {
    const conversation = await this.conversationRepository.findOneBy({
      id: conversationId,
    });

    if (conversation) {
      conversation.lastMessageAt = new Date();
      conversation.lastMessageText = messageText;

      // Incrémenter le compteur de non-lus pour le destinataire
      if (senderId === conversation.clientId) {
        conversation.unreadCountLawyer += 1;
      } else {
        conversation.unreadCountClient += 1;
      }

      await this.conversationRepository.save(conversation);
    }
  }
}
