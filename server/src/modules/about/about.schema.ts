import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../common/schemas/localized-string.schema.js';
import { Metric, MetricSchema } from '../../common/schemas/metric.schema.js';

const mediaRef = { type: SchemaTypes.ObjectId, ref: 'Media', default: null };

/** Shared by `timeline` (experience) and `education`. For education: title = degree, company = school. */
@Schema({ _id: false })
export class TimelineEntry {
  @Prop({ required: true }) period: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  title: LocalizedString;

  @Prop({ required: true }) company: string;

  @Prop({ type: LocalizedStringSchema })
  description?: LocalizedString;
}

/** Singleton: exactly one document. */
@Schema({ collection: 'about', timestamps: true })
export class About {
  @Prop(mediaRef) photo?: Types.ObjectId | null;

  @Prop({ type: LocalizedStringSchema, required: true })
  heading: LocalizedString;

  /** Markdown; sanitized when rendered. */
  @Prop({ type: LocalizedStringSchema, required: true })
  bio: LocalizedString;

  @Prop({ type: [MetricSchema], default: [] })
  stats: Metric[];

  @Prop({ type: [SchemaFactory.createForClass(TimelineEntry)], default: [] })
  timeline: TimelineEntry[];

  /** Shown next to the experience timeline with the same design. */
  @Prop({ type: [SchemaFactory.createForClass(TimelineEntry)], default: [] })
  education: TimelineEntry[];

  /** Show/hide the experience + education block (the rest of About stays). */
  @Prop({ default: true }) careerVisible: boolean;

  /** CV as PDF. */
  @Prop(mediaRef) cv?: Types.ObjectId | null;
}

export const AboutSchema = SchemaFactory.createForClass(About);

export const DEFAULT_ABOUT = {
  heading: { az: 'Haqqımda', en: 'About me', ru: 'Обо мне' },
  bio: { az: '', en: '', ru: '' },
  stats: [],
  timeline: [],
  education: [],
  careerVisible: true,
};
