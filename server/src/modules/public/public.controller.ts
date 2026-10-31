import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CACHE_KEYS } from '../../common/cache/cache-keys.js';
import { PublicCacheService } from '../../common/cache/public-cache.service.js';
import { AboutService } from '../about/about.service.js';
import { HeroService } from '../hero/hero.service.js';
import { SettingsService } from '../settings/settings.service.js';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly cache: PublicCacheService,
    private readonly settings: SettingsService,
    private readonly hero: HeroService,
    private readonly about: AboutService,
  ) {}

  /** Everything the site needs on first load, in one request. */
  @Get('bootstrap')
  bootstrap() {
    return this.cache.wrap(CACHE_KEYS.bootstrap, async () => {
      const [settings, hero, about] = await Promise.all([
        this.settings.get(),
        this.hero.get(),
        this.about.get(),
      ]);
      const sections = settings.sections
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order)
        .map((s) => s.key);
      return { settings, hero, about, sections };
    });
  }
}
