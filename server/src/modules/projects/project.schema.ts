import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../common/schemas/localized-string.schema.js';
import { Metric, MetricSchema } from '../../common/schemas/metric.schema.js';

@Schema({ _id: false })
export class ProjectSeo {
  @Prop({ type: LocalizedStringSchema }) title?: LocalizedString;
  @Prop({ type: LocalizedStringSchema }) description?: LocalizedString;
}

/** Case studies can be split into two groups (titles in settings.workGroups). */
export const PROJECT_GROUPS = ['primary', 'secondary'] as const;
export type ProjectGroup = (typeof PROJECT_GROUPS)[number];

/** A case study. */
@Schema({ collection: 'projects', timestamps: true })
export class Project {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  title: LocalizedString;

  @Prop({ required: true })
  client: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  category: LocalizedString;

  @Prop({ required: true })
  year: number;

  /** Short text shown on the card. */
  @Prop({ type: LocalizedStringSchema, required: true })
  summary: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  challenge: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  solution: LocalizedString;

  @Prop({ type: [MetricSchema], default: [] })
  results: Metric[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Media', required: true })
  cover: Types.ObjectId;

  /** Short loop played when the card is hovered. */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Media', default: null })
  coverVideo?: Types.ObjectId | null;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Media' }], default: [] })
  gallery: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, enum: PROJECT_GROUPS, default: 'primary' })
  group: ProjectGroup;

  @Prop({ default: false }) featured: boolean;
  @Prop({ default: false }) published: boolean;
  @Prop({ required: true }) order: number;

  @Prop({ type: SchemaFactory.createForClass(ProjectSeo) })
  seo?: ProjectSeo;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ published: 1, order: 1 });
