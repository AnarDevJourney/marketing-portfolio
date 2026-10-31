import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'admins', timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  lastLoginAt?: Date;

  /** Tokens issued before this moment are rejected. */
  @Prop()
  passwordChangedAt?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
