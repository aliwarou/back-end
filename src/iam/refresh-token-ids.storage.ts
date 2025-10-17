import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';

Injectable();
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;

  onApplicationBootstrap() {
    this.redisClient = new Redis({
      port: 6379,
      host: 'localhost',
    });
  }

  onApplicationShutdown(_signal?: string) {
    this.redisClient.quit();
  }

  async insert(userId: number, refreskhTokenId: string) {
    await this.redisClient.set(this.getKey(userId), refreskhTokenId);
  }

  async invalidate(userId: number) {
    this.redisClient.del(this.getKey(userId));
  }

  async validate(userId: number, refreskhTokenId: string) {
    const storedTokenId = await this.redisClient.get(this.getKey(userId));
    return refreskhTokenId == storedTokenId;
  }

  private getKey(userId: number) {
    return `user-${userId}`;
  }
}
