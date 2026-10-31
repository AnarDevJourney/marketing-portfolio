import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_KEYS } from '../../common/cache/cache-keys.js';
import { PublicCacheService } from '../../common/cache/public-cache.service.js';
import { OrderedCrudService } from '../../common/crud/ordered-crud.service.js';
import { CreateServiceDto } from './dto/service.dto.js';
import { ServiceItem } from './service.schema.js';

@Injectable()
export class ServicesService extends OrderedCrudService<
  ServiceItem,
  CreateServiceDto
> {
  protected readonly cachePrefix = CACHE_KEYS.services;

  constructor(
    @InjectModel(ServiceItem.name) model: Model<ServiceItem>,
    cache: PublicCacheService,
  ) {
    super(model, cache);
  }

  findPublic() {
    return this.findPublished(CACHE_KEYS.services);
  }
}
