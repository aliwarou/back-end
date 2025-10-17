import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConfig } from 'src/iam/config/config.jwt';
import { REQUEST_USER_KEY } from 'src/iam/iam.constant';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly configurationService: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(req);
    if (!token)
      throw new UnauthorizedException('Authentication token is missing');
    try {
      const paylod = await this.jwtService.verifyAsync(token, {
        audience: this.configurationService.audience,
        issuer: this.configurationService.issuer,
        secret: this.configurationService.secret,
      });

      req[REQUEST_USER_KEY] = paylod;
    } catch (err) {
      if ((err.name = 'JsonWebTokenError'))
        throw new UnauthorizedException(err.message);
      console.log(err);
      throw new InternalServerErrorException();
    }

    return true;
  }

  private extractTokenFromHeader(req: Request) {
    const [_, token] = req.headers.authorization?.split(' ') ?? [];

    return token;
  }
}
