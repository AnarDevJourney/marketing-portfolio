import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_KEYS } from '../../common/cache/cache-keys.js';
import { PublicCacheService } from '../../common/cache/public-cache.service.js';
import { OrderedCrudService } from '../../common/crud/ordered-crud.service.js';
import { populateMedia } from '../media/media.schema.js';
import { MediaService } from '../media/media.service.js';
import { CreateTestimonialDto } from './dto/testimonial.dto.js';
import { Testimonial } from './testimonial.schema.js';

@Injectable()
export class TestimonialsService extends OrderedCrudService<
  Testimonial,
  CreateTestimonialDto
> {
  protected readonly cachePrefix = CACHE_KEYS.testimonials;
  protected readonly populate = populateMedia('avatar');

  constructor(
    @InjectModel(Testimonial.name) model: Model<Testimonial>,
    cache: PublicCacheService,
    private readonly media: MediaService,
  ) {
    super(model, cache);
  }

  protected async validate(dto: Partial<CreateTestimonialDto>) {
    await this.media.assertExist([dto.avatar], 'image');
  }

  findPublic() {
    return this.findPublished(CACHE_KEYS.testimonials);
  }
}
