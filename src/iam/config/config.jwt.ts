import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accesTokenTtl: parseInt(process.env.JWT_ACCES_TOKEN_TTL),
  refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TOKEN_TTL),
  audience: process.env.JWT_TOKEN_AUDIENCE,
  issuer: process.env.JWT_TOKEN_ISSUER,
}));
