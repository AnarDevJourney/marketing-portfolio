import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Model, PopulateOptions, Types } from 'mongoose';
import { PublicCacheService } from '../cache/public-cache.service.js';
import { ReorderItemDto } from '../dto/reorder.dto.js';

/** Fields every sortable, publishable collection has. */
export interface Orderable {
  order: number;
  published: boolean;
}

/** Fields never sent to the public site. */
const INTERNAL_FIELDS = '-published -__v -createdAt -updatedAt';

/**
 * Shared admin CRUD + reorder + published listing for collections like
 * projects, clients, testimonials and services. Every write invalidates
 * the collection's public cache prefix.
 */
export abstract class OrderedCrudService<
  T extends Orderable,
  D extends { order?: number } = Partial<T>,
> {
  /** Cache key prefix of this collection's public responses. */
  protected abstract readonly cachePrefix: string;
  /** Media references to populate in responses. */
  protected readonly populate: PopulateOptions[] = [];

  // Typed loosely: Mongoose's generic filter types don't compose with an abstract T.
  protected readonly model: Model<any>;

  constructor(
    model: Model<T>,
    protected readonly cache: PublicCacheService,
  ) {
    this.model = model;
  }

  /** Validates references (e.g. media ids/types) before create and update. */
  protected async validate(_dto: Partial<D>): Promise<void> {}

  findAll() {
    return this.model
      .find()
      .sort({ order: 1, _id: 1 })
      .populate(this.populate)
      .lean<T[]>();
  }

  async findOne(id: Types.ObjectId | string) {
    const doc = await this.model.findById(id).populate(this.populate).lean<T>();
    if (!doc) throw new NotFoundException(`${this.model.modelName} not found`);
    return doc;
  }

  async create(dto: D) {
    await this.validate(dto);
    const order = dto.order ?? (await this.nextOrder());
    const doc = await this.model.create({ ...dto, order });
    await this.invalidate();
    return this.findOne(doc._id);
  }

  async update(id: Types.ObjectId, dto: Partial<D>) {
    await this.validate(dto);
    const res = await this.model.updateOne(
      { _id: id },
      { $set: dto },
      { runValidators: true },
    );
    if (!res.matchedCount) {
      throw new NotFoundException(`${this.model.modelName} not found`);
    }
    await this.invalidate();
    return this.findOne(id);
  }

  async remove(id: Types.ObjectId) {
    const res = await this.model.deleteOne({ _id: id });
    if (!res.deletedCount) {
      throw new NotFoundException(`${this.model.modelName} not found`);
    }
    await this.invalidate();
  }

  /** Applies a drag-and-drop result: `[{ id, order }]`. All ids must exist. */
  async reorder(items: ReorderItemDto[]) {
    const ids = items.map((i) => i.id);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Duplicate ids in reorder list');
    }
    const found = await this.model.countDocuments({ _id: { $in: ids } });
    if (found !== ids.length) {
      throw new BadRequestException('Some ids do not exist');
    }
    if (items.length) {
      await this.model.bulkWrite(
        items.map(({ id, order }) => ({
          updateOne: { filter: { _id: id }, update: { $set: { order } } },
        })),
      );
    }
    await this.invalidate();
    return this.findAll();
  }

  /** Published items sorted by `order`, cached under `key`. */
  protected findPublished(
    key: string,
    filter: Record<string, unknown> = {},
    select = INTERNAL_FIELDS,
  ) {
    return this.cache.wrap(key, () =>
      this.model
        .find({ ...filter, published: true })
        .sort({ order: 1, _id: 1 })
        .select(select)
        .populate(this.populate)
        .lean()
        .exec(),
    );
  }

  protected invalidate() {
    return this.cache.invalidate(this.cachePrefix);
  }

  private async nextOrder() {
    const last = await this.model
      .findOne()
      .sort({ order: -1 })
      .select('order')
      .lean<Orderable>();
    return last ? last.order + 1 : 0;
  }
}
