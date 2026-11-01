import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_KEYS } from '../../common/cache/cache-keys.js';
import { PublicCacheService } from '../../common/cache/public-cache.service.js';
import { populateMedia } from '../media/media.schema.js';
import { MediaService } from '../media/media.service.js';
import { About, DEFAULT_ABOUT } from './about.schema.js';
import { UpdateAboutDto } from './dto/update-about.dto.js';

@Injectable()
export class AboutService {
  constructor(
    @InjectModel(About.name) private readonly about: Model<About>,
    private readonly cache: PublicCacheService,
    private readonly media: MediaService,
  ) {}

  async get() {
    await this.about.updateOne(
      {},
      { $setOnInsert: DEFAULT_ABOUT },
      { upsert: true },
    );
    const about = await this.about
      .findOne()
      .populate(populateMedia('photo', 'cv'))
      .lean()
      .orFail();
    // Documents saved before `education` existed (lean() skips schema defaults).
    return {
      ...about,
      education: about.education ?? [],
      careerVisible: about.careerVisible ?? true,
    };
  }

  async replace(dto: UpdateAboutDto) {
    await this.media.assertExist([dto.photo], 'image');
    // 'file' media is PDF-only (see MEDIA_RULES).
    await this.media.assertExist([dto.cv], 'file');

    await this.about.replaceOne(
      {},
      {
        ...dto,
        education: dto.education ?? [],
        careerVisible: dto.careerVisible ?? true,
        photo: dto.photo ?? null,
        cv: dto.cv ?? null,
      },
      { upsert: true, runValidators: true },
    );
    await this.cache.invalidate(CACHE_KEYS.bootstrap);
    return this.get();
  }
}
