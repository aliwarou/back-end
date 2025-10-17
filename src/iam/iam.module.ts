import { Module } from '@nestjs/common';
import { AuthentificationService } from './authentification/authentification.service';
import { AuthentificationController } from './authentification/authentification.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './config/config.jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './authentification/guards/access-token.guard';
import { AuthentificationGuard } from './authentification/guards/authentification.guard';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { RoleGuard } from './authorization/guards/role.guard';
import { GoogleAuthService } from './authentification/oauth2/google-auth.service';
import { GoogleAuthController } from './authentification/oauth2/google-auth.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ConfigModule.forFeature(jwtConfig), JwtModule, UsersModule],
  providers: [
    AuthentificationService,
    ConfigService,
    AccessTokenGuard,
    RefreshTokenIdsStorage,
    { provide: APP_GUARD, useClass: AuthentificationGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
    GoogleAuthService,
  ],
  controllers: [AuthentificationController, GoogleAuthController],
})
export class IamModule {}
