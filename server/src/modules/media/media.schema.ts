import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  emptyLocalizedString,
  LocalizedString,
  LocalizedStringSchema,
} from '../../common/schemas/localized-string.schema.js';
import { MEDIA_KINDS, type MediaKind } from './media.constants.js';

@Schema({ _id: false })
export class MediaVariants {
  @Prop() w480?: string;
  @Prop() w1024?: string;
  @Prop() w1920?: string;
}

@Schema({ collection: 'media', timestamps: true })
export class Media {
  /** MinIO object key of the original file. */
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: String, required: true, enum: MEDIA_KINDS })
  type: MediaKind;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop() width?: number;
  @Prop() height?: number;
  @Prop() duration?: number;

  /** WebP variant URLs (images only). */
  @Prop({ type: SchemaFactory.createForClass(MediaVariants) })
  variants?: MediaVariants;

  @Prop()
  blurDataUrl?: string;

  @Prop({ type: LocalizedStringSchema, default: emptyLocalizedString })
  alt: LocalizedString;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
MediaSchema.index({ type: 1, createdAt: -1 });

/** Fields sent to clients when media is populated into other documents. */
export const MEDIA_PUBLIC_FIELDS =
  'url type mimeType width height duration variants blurDataUrl alt';
