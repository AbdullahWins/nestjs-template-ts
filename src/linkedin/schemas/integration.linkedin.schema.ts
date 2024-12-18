// schemas/integration.linkedin.schema.ts
import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface LinkedInIntegration extends Document {
  userId: string; // Reference to the User model
  accessToken: string; // Access token from LinkedIn
  refreshToken: string | null; // Refresh token from LinkedIn (nullable)
  expiresAt: Date; // Token expiration date
  idToken: string | null; // Optional ID token from LinkedIn (nullable)
}

@NestSchema()
export class LinkedInIntegration {
  @Prop()
  userId: string;

  @Prop()
  accessToken: string;

  @Prop({ default: null })
  refreshToken: string | null; // Allow refreshToken to be null

  @Prop()
  expiresAt: Date;

  @Prop({ default: null })
  idToken: string | null; // Optional ID token, nullable
}

export const LinkedInIntegrationSchema =
  SchemaFactory.createForClass(LinkedInIntegration);
