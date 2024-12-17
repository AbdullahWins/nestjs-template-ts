import { Document, model } from 'mongoose';
import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';

// Integration interface to define the schema structure
export interface MicrosoftIntegration extends Document {
  userId: string; // User ID that references the User model
  accessToken: string; // Access token for Microsoft OAuth
  refreshToken: string; // Refresh token for Microsoft OAuth
  expiresAt: Date; // Token expiration date
  scope: string; // Scopes for the access token
}

@NestSchema()
export class MicrosoftIntegration {
  // @Prop({ type: Schema.Types.ObjectId, ref: 'User' }) // Reference to the User model

  @Prop()
  userId: string; // This will store the ObjectId of the user from the User model

  @Prop()
  accessToken: string; // Store the Microsoft OAuth access token as a string

  @Prop()
  refreshToken: string; // Store the refresh token as a string

  @Prop()
  expiresAt: Date; // Store the expiration date of the access token

  @Prop()
  scope: string; // Store the scope of the access token
}

// Create the Integration schema
export const MicrosoftIntegrationSchema =
  SchemaFactory.createForClass(MicrosoftIntegration);

// Export the Integration model
export const MicrosoftIntegrationModel = model<MicrosoftIntegration>(
  'MicrosoftIntegration',
  MicrosoftIntegrationSchema,
);
