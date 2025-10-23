import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RoleEnum } from '../../iam/authentification/enums/role.enum';

interface AuthenticatedSocket extends Socket {
  user?: {
    sub: number;
    email: string;
    role: RoleEnum;
  };
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();

      // Extraire le token du handshake
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new WsException('Token manquant');
      }

      // Vérifier et décoder le token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attacher l'utilisateur au socket
      client.user = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch (error) {
      throw new WsException('Token invalide ou expiré');
    }
  }

  private extractTokenFromHandshake(
    client: AuthenticatedSocket,
  ): string | null {
    // Méthode 1: Token dans le query parameter
    const tokenFromQuery = client.handshake.query?.token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    // Méthode 2: Token dans les headers (Authorization: Bearer <token>)
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : null;
    }

    // Méthode 3: Token dans l'auth handshake
    const tokenFromAuth = client.handshake.auth?.token;
    if (tokenFromAuth) {
      return tokenFromAuth;
    }

    return null;
  }
}
