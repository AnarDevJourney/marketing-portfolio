import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { LOCALES, type Locale } from '../../common/locales.js';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../common/schemas/localized-string.schema.js';
import {
  BODY_FONTS,
  HEADING_FONTS,
  SECTION_KEYS,
  SOCIAL_PLATFORMS,
  type BodyFont,
  type HeadingFont,
  type SectionKey,
  type SocialPlatform,
} from './settings.constants.js';

const mediaRef = { type: SchemaTypes.ObjectId, ref: 'Media', default: null };

@Schema({ _id: false })
export class Colors {
  @Prop({ required: true }) primary: string;
  @Prop({ required: true }) accent: string;
  @Prop({ required: true }) background: string;
  @Prop({ required: true }) surface: string;
  @Prop({ required: true }) text: string;
}

@Schema({ _id: false })
export class Fonts {
  @Prop({ type: String, required: true, enum: HEADING_FONTS })
  heading: HeadingFont;

  @Prop({ type: String, required: true, enum: BODY_FONTS })
  body: BodyFont;
}

@Schema({ _id: false })
export class Social {
  @Prop({ type: String, required: true, enum: SOCIAL_PLATFORMS })
  platform: SocialPlatform;

  @Prop({ required: true })
  url: string;
}

@Schema({ _id: false })
export class ContactInfo {
  @Prop({ required: true }) email: string;
  @Prop() phone?: string;
  @Prop({ type: LocalizedStringSchema, required: true })
  location: LocalizedString;
}

@Schema({ _id: false })
export class SectionConfig {
  @Prop({ type: String, required: true, enum: SECTION_KEYS })
  key: SectionKey;

  @Prop({ required: true }) enabled: boolean;
  @Prop({ required: true }) order: number;
}

@Schema({ _id: false })
export class Seo {
  @Prop({ type: LocalizedStringSchema, required: true })
  title: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  description: LocalizedString;

  @Prop(mediaRef) ogImage?: Types.ObjectId | null;
}

@Schema({ _id: false })
export class LocaleConfig {
  @Prop({ type: String, required: true, enum: LOCALES })
  default: Locale;

  @Prop({ type: [String], enum: LOCALES, required: true })
  enabled: Locale[];
}

@Schema({ _id: false })
export class Features {
  @Prop({ required: true }) customCursor: boolean;
  @Prop({ required: true }) preloader: boolean;
  @Prop({ required: true }) smoothScroll: boolean;
}

/** Singleton: exactly one document, created on first start / seed. */
@Schema({ collection: 'settings', timestamps: true })
export class Settings {
  @Prop({ required: true }) siteName: string;

  @Prop(mediaRef) logo?: Types.ObjectId | null;
  @Prop(mediaRef) logoDark?: Types.ObjectId | null;
  @Prop(mediaRef) favicon?: Types.ObjectId | null;

  @Prop({ type: SchemaFactory.createForClass(Colors), required: true })
  colors: Colors;

  @Prop({ type: SchemaFactory.createForClass(Fonts), required: true })
  font: Fonts;

  @Prop({ type: [SchemaFactory.createForClass(Social)], default: [] })
  socials: Social[];

  @Prop({ type: SchemaFactory.createForClass(ContactInfo), required: true })
  contact: ContactInfo;

  @Prop({ type: [SchemaFactory.createForClass(SectionConfig)], default: [] })
  sections: SectionConfig[];

  @Prop({ type: SchemaFactory.createForClass(Seo), required: true })
  seo: Seo;

  @Prop({ type: SchemaFactory.createForClass(LocaleConfig), required: true })
  locales: LocaleConfig;

  @Prop({ type: SchemaFactory.createForClass(Features), required: true })
  features: Features;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
