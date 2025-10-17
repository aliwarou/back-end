import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { HashingService } from '../../users/hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { jwtConfig } from '../config/config.jwt';
import { SignInDto } from './dto/sign-in.dto';
import { ActiveUserData } from '../interfaces/active-user.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { randomUUID } from 'crypto';
import { RefreshTokenIdsStorage } from '../refresh-token-ids.storage';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthentificationService {
  constructor(
    private readonly userService: UsersService,
    private readonly haschingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly confiurationService: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.userService.findOneByEmail(email);

    if (!user) throw new UnauthorizedException('incoreect email or password');

    const isEqual = await this.haschingService.compare(password, user.password);

    if (!isEqual)
      throw new UnauthorizedException('incorrect email or password');
    return this.generateTokens(user);
  }

  async signUp(signUpDto: SignUpDto) {
    const newUser = await this.userService.create(signUpDto);
    return await this.generateTokens(newUser);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.confiurationService.secret,
        audience: this.confiurationService.audience,
        issuer: this.confiurationService.issuer,
      });

      const user = await this.userService.findOne(sub);
      const isValide = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId,
      );

      if (!isValide)
        throw new UnauthorizedException('refresh token is not valide');

      await this.refreshTokenIdsStorage.invalidate(user.id);

      return this.generateTokens(user);
    } catch (e) {
      if (e.name == 'JsonWebTokenError' || e.name == 'TokenExpiredError') {
        throw new UnauthorizedException(e.message);
      }
      throw new UnauthorizedException();
    }
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.confiurationService.accesTokenTtl,
        { email: user.email, role: user.role },
      ),
      this.signToken(user.id, this.confiurationService.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async signToken<T>(userId: number, expiresIn: number, payload: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        issuer: this.confiurationService.issuer,
        audience: this.confiurationService.audience,
        secret: this.confiurationService.secret,
        expiresIn,
      },
    );
  }
}
