import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';

/** Several admin edits in a row → one site rebuild. */
const DEBOUNCE_MS = 2 * 60 * 1000;

/**
 * Asks Netlify to rebuild the public site (refreshing the prerendered pages,
 * sitemap.xml and social previews) after admin content changes. No-op unless
 * NETLIFY_BUILD_HOOK_URL is set. Called from PublicCacheService.invalidate().
 */
@Injectable()
export class BuildHookService implements OnModuleDestroy {
  private readonly logger = new Logger(BuildHookService.name);
  private readonly url?: string;
  private timer?: NodeJS.Timeout;

  constructor(config: ConfigService<Env, true>) {
    this.url = config.get('NETLIFY_BUILD_HOOK_URL', { infer: true });
  }

  schedule() {
    if (!this.url) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.trigger(), DEBOUNCE_MS);
    this.timer.unref();
  }

  private async trigger() {
    try {
      const res = await fetch(this.url!, {
        method: 'POST',
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.logger.log('Site rebuild requested');
    } catch (err) {
      this.logger.warn(
        `Site rebuild request failed: ${(err as Error).message}`,
      );
    }
  }

  onModuleDestroy() {
    clearTimeout(this.timer);
  }
}
