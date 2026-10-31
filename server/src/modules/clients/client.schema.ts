import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'clients', timestamps: true })
export class Client {
  @Prop({ required: true }) name: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Media', required: true })
  logo: Types.ObjectId;

  @Prop() website?: string;
  @Prop({ required: true }) order: number;
  @Prop({ default: false }) published: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
ClientSchema.index({ published: 1, order: 1 });
