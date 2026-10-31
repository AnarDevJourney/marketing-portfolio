import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { PUBLIC_CACHE_TTL } from './cache-keys.js';
import { PublicCacheService } from './public-cache.service.js';

@Global()
@Module({
  imports: [CacheModule.register({ ttl: PUBLIC_CACHE_TTL })],
  providers: [PublicCacheService],
  exports: [PublicCacheService],
})
export class PublicCacheModule {}
