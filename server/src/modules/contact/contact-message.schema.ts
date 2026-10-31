import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LOCALES, type Locale } from '../../common/locales.js';

@Schema({ collection: 'contact_messages', timestamps: true })
export class ContactMessage {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) email: string;
  @Prop() phone?: string;
  @Prop() subject?: string;
  @Prop({ required: true }) message: string;

  @Prop({ type: String, required: true, enum: LOCALES })
  locale: Locale;

  @Prop({ default: false }) read: boolean;
  @Prop() ip?: string;
  @Prop() userAgent?: string;
}

export const ContactMessageSchema =
  SchemaFactory.createForClass(ContactMessage);
ContactMessageSchema.index({ read: 1, createdAt: -1 });
