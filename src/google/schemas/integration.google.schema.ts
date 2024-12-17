import { Document, model, Schema } from 'mongoose';
import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';

// GoogleIntegration interface to define the schema structure
export interface GoogleIntegration extends Document {
  userId: string; // User ID that references the User model
  accessToken: string; // Access token for Google OAuth
  refreshToken: string; // Refresh token for Google OAuth
  expiresAt: Date; // Token expiration date
  scope: string; // Scopes for the access token
}

@NestSchema()
export class GoogleIntegration {
  // @Prop({ type: Schema.Types.ObjectId, ref: 'User' }) // Reference to the User model

  @Prop()
  userId: string; // This will store the ObjectId of the user from the User model

  @Prop()
  accessToken: string; // Store the Google OAuth access token as a string

  @Prop()
  refreshToken: string; // Store the refresh token as a string

  @Prop()
  expiresAt: Date; // Store the expiration date of the access token

  @Prop()
  scope: string; // Store the scope of the access token
}

// Create the google integration schema
export const GoogleIntegrationSchema =
  SchemaFactory.createForClass(GoogleIntegration);

// Export the Integration model
export const GoogleIntegrationModel = model<GoogleIntegration>(
  'GoogleIntegration',
  GoogleIntegrationSchema,
);
