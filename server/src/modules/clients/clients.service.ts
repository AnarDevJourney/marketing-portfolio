import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_KEYS } from '../../common/cache/cache-keys.js';
import { PublicCacheService } from '../../common/cache/public-cache.service.js';
import { OrderedCrudService } from '../../common/crud/ordered-crud.service.js';
import { populateMedia } from '../media/media.schema.js';
import { MediaService } from '../media/media.service.js';
import { Client } from './client.schema.js';
import { CreateClientDto } from './dto/client.dto.js';

@Injectable()
export class ClientsService extends OrderedCrudService<
  Client,
  CreateClientDto
> {
  protected readonly cachePrefix = CACHE_KEYS.clients;
  protected readonly populate = populateMedia('logo');

  constructor(
    @InjectModel(Client.name) model: Model<Client>,
    cache: PublicCacheService,
    private readonly media: MediaService,
  ) {
    super(model, cache);
  }

  protected async validate(dto: Partial<CreateClientDto>) {
    await this.media.assertExist([dto.logo], 'image');
  }

  findPublic() {
    return this.findPublished(CACHE_KEYS.clients);
  }
}
