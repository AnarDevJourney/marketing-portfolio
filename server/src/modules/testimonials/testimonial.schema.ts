import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../common/schemas/localized-string.schema.js';

@Schema({ collection: 'testimonials', timestamps: true })
export class Testimonial {
  @Prop({ required: true }) author: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  role: LocalizedString;

  @Prop() company?: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  quote: LocalizedString;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Media', default: null })
  avatar?: Types.ObjectId | null;

  @Prop({ required: true }) order: number;
  @Prop({ default: false }) published: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
TestimonialSchema.index({ published: 1, order: 1 });
