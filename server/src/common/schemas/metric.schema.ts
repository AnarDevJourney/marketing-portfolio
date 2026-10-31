import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from './localized-string.schema.js';

/** A number with optional prefix/suffix, e.g. "+240%" reach or "8+" years. */
@Schema({ _id: false })
export class Metric {
  @Prop({ required: true }) value: number;
  @Prop() prefix?: string;
  @Prop() suffix?: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  label: LocalizedString;
}

export const MetricSchema = SchemaFactory.createForClass(Metric);
