import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: false, default: null }) // Set default to null
  profilePicture?: string | null;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: null }) // Default to null, managed via soft delete
  deletedAt?: Date | null; // Optional field
}

export const UserSchema = SchemaFactory.createForClass(User);
