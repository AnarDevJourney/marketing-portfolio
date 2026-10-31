import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { CACHE_KEYS } from '../../common/cache/cache-keys.js';
import { MEDIA_PUBLIC_FIELDS } from '../media/media.schema.js';
import { MediaService } from '../media/media.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { DEFAULT_SETTINGS, SECTION_KEYS } from './settings.constants.js';
import { Settings } from './settings.schema.js';

const MEDIA_PATHS = ['logo', 'logoDark', 'favicon', 'seo.ogImage'];

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private readonly settings: Model<Settings>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly media: MediaService,
  ) {}

  /** The settings document with media references populated. */
  async get() {
    await this.ensureDefaults();
    return this.settings
      .findOne()
      .populate(
        MEDIA_PATHS.map((path) => ({ path, select: MEDIA_PUBLIC_FIELDS })),
      )
      .lean()
      .orFail();
  }

  async update(dto: UpdateSettingsDto) {
    this.assertConsistent(dto);
    await this.media.assertExist([
      dto.logo,
      dto.logoDark,
      dto.favicon,
      dto.seo?.ogImage,
    ]);
    await this.ensureDefaults();
    await this.settings.updateOne({}, { $set: dto }, { runValidators: true });
    await this.cache.del(CACHE_KEYS.bootstrap);
    return this.get();
  }

  /** Creates the singleton with default values if it doesn't exist yet. */
  async ensureDefaults() {
    await this.settings.updateOne(
      {},
      { $setOnInsert: DEFAULT_SETTINGS },
      { upsert: true },
    );
  }

  private assertConsistent(dto: UpdateSettingsDto) {
    if (dto.sections) {
      const keys = dto.sections.map((s) => s.key);
      if (
        keys.length !== SECTION_KEYS.length ||
        new Set(keys).size !== keys.length
      ) {
        throw new BadRequestException(
          `sections must list each of ${SECTION_KEYS.join(', ')} exactly once`,
        );
      }
    }
    if (dto.locales && !dto.locales.enabled.includes(dto.locales.default)) {
      throw new BadRequestException(
        'locales.default must be one of locales.enabled',
      );
    }
  }
}
