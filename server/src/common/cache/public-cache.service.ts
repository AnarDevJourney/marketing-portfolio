import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PUBLIC_CACHE_TTL } from './cache-keys.js';

/**
 * In-memory cache for public responses. Remembers the keys it has set so
 * admin writes can invalidate by prefix (single API instance, so this is exact).
 */
@Injectable()
export class PublicCacheService {
  private readonly keys = new Set<string>();

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async wrap<T>(key: string, load: () => Promise<T>): Promise<T> {
    const hit = await this.cache.get<T>(key);
    if (hit !== undefined && hit !== null) return hit;
    const value = await load();
    await this.cache.set(key, value, PUBLIC_CACHE_TTL);
    this.keys.add(key);
    return value;
  }

  /** Deletes every cached key that starts with one of the prefixes. */
  async invalidate(...prefixes: string[]) {
    const stale = [...this.keys].filter((k) =>
      prefixes.some((p) => k.startsWith(p)),
    );
    if (!stale.length) return;
    stale.forEach((k) => this.keys.delete(k));
    await this.cache.mdel(stale);
  }
}
