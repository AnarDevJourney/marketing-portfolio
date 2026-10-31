import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../common/schemas/localized-string.schema.js';

/** A service offered (e.g. SMM, branding). Named ServiceItem to avoid clashing with Nest's "service". */
@Schema({ collection: 'services', timestamps: true })
export class ServiceItem {
  @Prop({ type: LocalizedStringSchema, required: true })
  title: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  description: LocalizedString;

  /** lucide-react icon name, e.g. "megaphone". */
  @Prop({ required: true }) icon: string;

  @Prop({ required: true }) order: number;
  @Prop({ default: false }) published: boolean;
}

export const ServiceItemSchema = SchemaFactory.createForClass(ServiceItem);
ServiceItemSchema.index({ published: 1, order: 1 });
