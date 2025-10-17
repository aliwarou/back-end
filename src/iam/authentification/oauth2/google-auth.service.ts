import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthentificationService } from '../authentification.service';
import { OAuth2Client } from 'google-auth-library';
import { UNIQUE_CONSTRAINT } from 'constants/postgres-codes.constant';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleAuthService implements OnModuleInit {
  private oAuth2client: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly authSevice: AuthentificationService,
    private readonly userService: UsersService,
  ) {}
  onModuleInit() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.oAuth2client = new OAuth2Client({ clientId, clientSecret });
  }

  async authenticate(token: string) {
    try {
      const loginTicket = await this.oAuth2client.verifyIdToken({
        idToken: token,
      });

      const { sub: googleId, email, name } = loginTicket.getPayload();

      const user = await this.userService.findOneByGoogeId(googleId);
      console.log('newUser', user);

      if (user) return this.authSevice.generateTokens(user);

      const newUser = await this.userService.create({
        name,
        email: email,
        googleId,
      });

      console.log('newUser', newUser);

      return await this.authSevice.generateTokens(newUser);
    } catch (err) {
      if (err.code == UNIQUE_CONSTRAINT) throw new ConflictException();
      console.error(err);
      throw new UnauthorizedException();
    }
  }
}
