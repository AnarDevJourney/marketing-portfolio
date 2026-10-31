import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { type Connection, Model, Types } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { ListMediaDto } from './dto/list-media.dto.js';
import { UpdateMediaDto } from './dto/update-media.dto.js';
import { processImage } from './image-processor.js';
import { MEDIA_REFERENCES, type MediaKind } from './media.constants.js';
import { Media, MediaVariants } from './media.schema.js';
import { StorageService } from './storage.service.js';
import { classifyUpload, UploadFile } from './upload-validation.js';

export interface MediaUsage {
  collection: string;
  id: string;
  field: string;
}

const FOLDERS: Record<MediaKind, string> = {
  image: 'images',
  video: 'videos',
  file: 'files',
};

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private readonly media: Model<Media>,
    @InjectConnection() private readonly connection: Connection,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly storage: StorageService,
  ) {}

  async upload(files: UploadFile[]) {
    if (!files.length) throw new BadRequestException('No files uploaded');
    // Validate the whole batch before storing anything.
    const checked = files.map((file) => ({ file, ...classifyUpload(file) }));
    const created = [];
    for (const { file, kind, ext } of checked) {
      created.push(await this.store(file, kind, ext));
    }
    return created;
  }

  async list({ type, page, limit }: ListMediaDto) {
    const filter = type ? { type } : {};
    const [items, total] = await Promise.all([
      this.media
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.media.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: Types.ObjectId) {
    const doc = await this.media.findById(id).lean();
    if (!doc) throw new NotFoundException('Media not found');
    return doc;
  }

  async update(id: Types.ObjectId, dto: UpdateMediaDto) {
    const doc = await this.media
      .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
      .lean();
    if (!doc) throw new NotFoundException('Media not found');
    // Media is embedded in many public responses; alt text changed, so drop them all.
    await this.cache.clear();
    return doc;
  }

  async remove(id: Types.ObjectId) {
    const doc = await this.findOne(id);
    const usedIn = await this.findUsage(id);
    if (usedIn.length) {
      throw new ConflictException({
        message: 'Media is in use and cannot be deleted',
        usedIn,
      });
    }
    const variantKeys = Object.values(doc.variants ?? {})
      .map((url: string) => this.storage.keyFromUrl(url))
      .filter((k): k is string => !!k);
    await this.storage.remove([doc.key, ...variantKeys]);
    await this.media.deleteOne({ _id: id });
  }

  /** Lists every document field that references this media. */
  async findUsage(id: Types.ObjectId): Promise<MediaUsage[]> {
    const usage = await Promise.all(
      MEDIA_REFERENCES.map(async ({ collection, fields }) => {
        const docs = await this.connection
          .collection(collection)
          .find(
            { $or: fields.map((f) => ({ [f]: id })) },
            { projection: Object.fromEntries(fields.map((f) => [f, 1])) },
          )
          .toArray();
        return docs.flatMap((doc) =>
          fields
            .filter((field) => refersTo(getPath(doc, field), id))
            .map((field) => ({ collection, id: String(doc._id), field })),
        );
      }),
    );
    return usage.flat();
  }

  /** Throws if any of the given ids is not an existing media document. */
  async assertExist(ids: (string | null | undefined)[]) {
    const unique = [...new Set(ids.filter((id): id is string => !!id))];
    if (!unique.length) return;
    const found = await this.media.countDocuments({ _id: { $in: unique } });
    if (found !== unique.length) {
      throw new BadRequestException('Referenced media does not exist');
    }
  }

  private async store(file: UploadFile, kind: MediaKind, ext: string) {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const base = `${FOLDERS[kind]}/${now.getFullYear()}/${month}/${randomUUID()}`;
    const key = `${base}.${ext}`;
    const stored: string[] = [];
    const put = async (k: string, data: Buffer, type: string) => {
      const url = await this.storage.put(k, data, type);
      stored.push(k);
      return url;
    };

    try {
      if (kind !== 'image') {
        const url = await put(key, file.buffer, file.mimetype);
        return await this.media.create({
          key,
          url,
          type: kind,
          mimeType: file.mimetype,
          size: file.size,
        });
      }

      const img = await processImage(file.buffer, file.mimetype);
      const url = await put(key, img.original, file.mimetype);
      const variants: MediaVariants = {};
      for (const v of img.variants) {
        variants[`w${v.width}`] = await put(
          `${base}-w${v.width}.webp`,
          v.buffer,
          'image/webp',
        );
      }
      return await this.media.create({
        key,
        url,
        type: kind,
        mimeType: file.mimetype,
        size: img.original.length,
        width: img.width,
        height: img.height,
        variants,
        blurDataUrl: img.blurDataUrl,
      });
    } catch (err) {
      await this.storage.remove(stored).catch(() => undefined);
      throw err;
    }
  }
}

function getPath(doc: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (v, k) => (v as Record<string, unknown> | undefined)?.[k],
      doc,
    );
}

function refersTo(value: unknown, id: Types.ObjectId): boolean {
  if (Array.isArray(value)) return value.some((v) => refersTo(v, id));
  return value instanceof Types.ObjectId && value.equals(id);
}
