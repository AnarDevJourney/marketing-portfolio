import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_KEYS } from '../../common/cache/cache-keys.js';
import { PublicCacheService } from '../../common/cache/public-cache.service.js';
import { populateMedia } from '../media/media.schema.js';
import { MediaService } from '../media/media.service.js';
import { UpdateHeroDto } from './dto/update-hero.dto.js';
import { DEFAULT_HERO, Hero } from './hero.schema.js';

@Injectable()
export class HeroService {
  constructor(
    @InjectModel(Hero.name) private readonly hero: Model<Hero>,
    private readonly cache: PublicCacheService,
    private readonly media: MediaService,
  ) {}

  async get() {
    await this.hero.updateOne(
      {},
      { $setOnInsert: DEFAULT_HERO },
      { upsert: true },
    );
    return this.hero
      .findOne()
      .populate(populateMedia('background.media', 'background.poster'))
      .lean()
      .orFail();
  }

  async replace(dto: UpdateHeroDto) {
    const { type, media, poster } = dto.background;
    if (type !== 'none') await this.media.assertExist([media], type);
    await this.media.assertExist([poster], 'image');

    await this.hero.replaceOne(
      {},
      {
        ...dto,
        background: {
          ...dto.background,
          media: type === 'none' ? null : (media ?? null),
          poster: poster ?? null,
        },
      },
      { upsert: true, runValidators: true },
    );
    await this.cache.invalidate(CACHE_KEYS.bootstrap);
    return this.get();
  }
}
