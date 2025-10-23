import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { RoleEnum } from '../iam/authentification/enums/role.enum';

interface AuthenticatedSocket extends Socket {
  user?: {
    sub: number;
    email: string;
    role: RoleEnum;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*', // En production, spécifier le domaine exact
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map pour suivre les utilisateurs connectés
  private connectedUsers: Map<number, string> = new Map();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
  ) {}

  /**
   * Connexion d'un utilisateur
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // L'authentification sera gérée par le middleware
      console.log(`Client connecté: ${client.id}`);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      client.disconnect();
    }
  }

  /**
   * Déconnexion d'un utilisateur
   */
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.connectedUsers.delete(client.user.sub);

      // Notifier les autres utilisateurs que cet utilisateur est hors ligne
      this.server.emit('user:offline', {
        userId: client.user.sub,
        timestamp: new Date(),
      });

      console.log(`Client déconnecté: ${client.id} (User: ${client.user.sub})`);
    }
  }

  /**
   * Joindre une conversation
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { conversationId } = data;
      const activeUser = {
        sub: client.user.sub,
        email: client.user.email,
        role: client.user.role,
      };

      // Vérifier que l'utilisateur a accès à cette conversation
      await this.conversationsService.findOne(conversationId, activeUser);

      // Joindre la room de la conversation
      client.join(`conversation:${conversationId}`);

      // Enregistrer l'utilisateur comme connecté
      this.connectedUsers.set(client.user.sub, client.id);

      // Notifier que l'utilisateur est en ligne
      this.server.emit('user:online', {
        userId: client.user.sub,
        timestamp: new Date(),
      });

      return {
        success: true,
        message: `Rejoint la conversation ${conversationId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Quitter une conversation
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('conversation:leave')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { conversationId } = data;
    client.leave(`conversation:${conversationId}`);

    return {
      success: true,
      message: `Quitté la conversation ${conversationId}`,
    };
  }

  /**
   * Envoyer un message
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody()
    data: { conversationId: number; content: string; attachments?: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const activeUser = {
        sub: client.user.sub,
        email: client.user.email,
        role: client.user.role,
      };

      // Sauvegarder le message en base de données
      const message = await this.messagesService.create(
        {
          conversationId: data.conversationId,
          content: data.content,
          attachments: data.attachments,
        },
        activeUser,
      );

      // Émettre le message à tous les membres de la conversation
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('message:new', {
          message,
          timestamp: new Date(),
        });

      return {
        success: true,
        message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Indicateur "en train d'écrire..."
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:typing')
  handleTyping(
    @MessageBody() data: { conversationId: number; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { conversationId, isTyping } = data;

    // Émettre à tous sauf à l'expéditeur
    client.to(`conversation:${conversationId}`).emit('user:typing', {
      userId: client.user.sub,
      conversationId,
      isTyping,
      timestamp: new Date(),
    });

    return { success: true };
  }

  /**
   * Marquer un message comme lu
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @MessageBody() data: { messageId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const activeUser = {
        sub: client.user.sub,
        email: client.user.email,
        role: client.user.role,
      };

      const message = await this.messagesService.findOne(
        data.messageId,
        activeUser,
      );

      if (message.senderId !== client.user.sub) {
        // Mettre à jour le statut lu (à implémenter dans le service)
        // await this.messagesService.markAsRead(data.messageId);

        // Notifier l'expéditeur
        this.server
          .to(`conversation:${message.conversationId}`)
          .emit('message:read:ack', {
            messageId: data.messageId,
            readBy: client.user.sub,
            timestamp: new Date(),
          });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtenir les utilisateurs en ligne dans une conversation
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('conversation:users:online')
  async handleGetOnlineUsers(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const room = this.server.sockets.adapter.rooms.get(
        `conversation:${data.conversationId}`,
      );

      const onlineUserIds: number[] = [];
      if (room) {
        for (const socketId of room) {
          const socket = this.server.sockets.sockets.get(
            socketId,
          ) as AuthenticatedSocket;
          if (socket?.user) {
            onlineUserIds.push(socket.user.sub);
          }
        }
      }

      return {
        success: true,
        onlineUsers: onlineUserIds,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Méthode utilitaire pour envoyer une notification à un utilisateur spécifique
   */
  sendNotificationToUser(userId: number, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  /**
   * Méthode utilitaire pour envoyer un message à une conversation
   */
  sendMessageToConversation(conversationId: number, event: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }
}
