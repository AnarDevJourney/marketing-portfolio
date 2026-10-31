import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_KEYS } from '../../common/cache/cache-keys.js';
import { PublicCacheService } from '../../common/cache/public-cache.service.js';
import { OrderedCrudService } from '../../common/crud/ordered-crud.service.js';
import { populateMedia } from '../media/media.schema.js';
import { MediaService } from '../media/media.service.js';
import { CreateProjectDto } from './dto/project.dto.js';
import { Project } from './project.schema.js';

/** Fields shown on project cards. */
const CARD_FIELDS =
  'slug title client category year summary cover coverVideo tags featured';

@Injectable()
export class ProjectsService extends OrderedCrudService<
  Project,
  CreateProjectDto
> {
  protected readonly cachePrefix = CACHE_KEYS.projects;
  protected readonly populate = populateMedia('cover', 'coverVideo', 'gallery');

  constructor(
    @InjectModel(Project.name) model: Model<Project>,
    cache: PublicCacheService,
    private readonly media: MediaService,
  ) {
    super(model, cache);
  }

  protected async validate(dto: Partial<CreateProjectDto>) {
    await this.media.assertExist([dto.cover, ...(dto.gallery ?? [])], 'image');
    await this.media.assertExist([dto.coverVideo], 'video');
  }

  /** Published project cards, optionally only featured ones. */
  findCards(featured = false) {
    return this.findPublished(
      CACHE_KEYS.projectList(featured),
      featured ? { featured: true } : {},
      CARD_FIELDS,
    );
  }

  /** Published case study by slug, plus the next one in order (wraps around). */
  findBySlug(slug: string) {
    return this.cache.wrap(CACHE_KEYS.project(slug), async () => {
      const project = await this.model
        .findOne({ slug, published: true })
        .select('-published -__v -createdAt -updatedAt')
        .populate(this.populate)
        .lean<Project & { _id: Types.ObjectId }>();
      if (!project) throw new NotFoundException('Project not found');

      const cards = await this.findCards();
      const i = cards.findIndex((c) => c._id.equals(project._id));
      const next = cards.length > 1 ? cards[(i + 1) % cards.length] : null;
      return { ...project, next };
    });
  }
}
