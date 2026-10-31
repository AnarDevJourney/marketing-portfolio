import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../common/schemas/localized-string.schema.js';

export const HERO_BACKGROUND_TYPES = ['image', 'video', 'none'] as const;
export type HeroBackgroundType = (typeof HERO_BACKGROUND_TYPES)[number];

const mediaRef = { type: SchemaTypes.ObjectId, ref: 'Media', default: null };

@Schema({ _id: false })
export class HeroCta {
  @Prop({ type: LocalizedStringSchema, required: true })
  label: LocalizedString;

  @Prop({ required: true })
  href: string;
}

@Schema({ _id: false })
export class HeroBackground {
  @Prop({ type: String, required: true, enum: HERO_BACKGROUND_TYPES })
  type: HeroBackgroundType;

  @Prop(mediaRef) media?: Types.ObjectId | null;
  @Prop(mediaRef) poster?: Types.ObjectId | null;

  @Prop({ required: true, min: 0, max: 1 })
  overlayOpacity: number;
}

/** Singleton: exactly one document. */
@Schema({ collection: 'hero', timestamps: true })
export class Hero {
  @Prop({ type: LocalizedStringSchema })
  eyebrow?: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  title: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  subtitle: LocalizedString;

  @Prop({ type: SchemaFactory.createForClass(HeroCta), required: true })
  cta: HeroCta;

  @Prop({ type: SchemaFactory.createForClass(HeroBackground), required: true })
  background: HeroBackground;
}

export const HeroSchema = SchemaFactory.createForClass(Hero);

/** Placeholder content written on first read. */
export const DEFAULT_HERO = {
  eyebrow: {
    az: 'Marketinq mütəxəssisi',
    en: 'Marketing specialist',
    ru: 'Маркетолог',
  },
  title: {
    az: 'Brendləri hekayəyə çevirirəm',
    en: 'I turn brands into stories',
    ru: 'Превращаю бренды в истории',
  },
  subtitle: { az: '', en: '', ru: '' },
  cta: {
    label: { az: 'Əlaqə', en: 'Get in touch', ru: 'Связаться' },
    href: '#contact',
  },
  background: { type: 'none' as HeroBackgroundType, overlayOpacity: 0.4 },
};
