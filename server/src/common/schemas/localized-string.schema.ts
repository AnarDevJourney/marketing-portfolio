import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** Translatable text: one value per locale. Empty string = not translated yet. */
@Schema({ _id: false })
export class LocalizedString {
  @Prop({ type: String, default: '' })
  az: string;

  @Prop({ type: String, default: '' })
  en: string;

  @Prop({ type: String, default: '' })
  ru: string;
}

export const LocalizedStringSchema =
  SchemaFactory.createForClass(LocalizedString);

export const emptyLocalizedString = (): LocalizedString => ({
  az: '',
  en: '',
  ru: '',
});
