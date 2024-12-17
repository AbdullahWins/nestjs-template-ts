import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleIntegration } from './schemas/integration.google.schema';

@Injectable()
export class GoogleService {
  private oauth2Client: any; // Declare oauth2Client property

  constructor(
    @InjectModel('GoogleIntegration')
    private readonly googleIntegrationModel: Model<GoogleIntegration>,
  ) {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
      process.env;
    // Initialize oauth2Client with necessary credentials
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI, // Make sure this is in your .env file
    );
  }

  private expiresAtFromSeconds(seconds: number) {
    return new Date(Date.now() + seconds * 1000);
  }

  // Step 1: Save Google OAuth tokens after authorization
  async save(userId: string, code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    const { error, access_token, refresh_token, expires_in, scope } =
      await response.json();

    if (error) throw new Error('Error in Google OAuth: ' + error);

    const newGoogleIntegration = new this.googleIntegrationModel({
      userId, // Save the userId here
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: this.expiresAtFromSeconds(expires_in),
      scope,
    });

    console.log('Saving google integration:', newGoogleIntegration);
    await newGoogleIntegration.save();
    return newGoogleIntegration;
  }

  // Step 2: Refresh access token if expired
  async refreshIfExpired(googleIntegrationId: string) {
    const googleIntegration =
      await this.googleIntegrationModel.findById(googleIntegrationId);
    if (!googleIntegration) throw new Error('Google integration not found.');

    if (googleIntegration.expiresAt > new Date())
      return googleIntegration.accessToken;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: googleIntegration.refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });

    const { access_token, expires_in, error, scope } = await response.json();
    if (error) throw new Error('Unable to refresh token.');

    googleIntegration.accessToken = access_token;
    googleIntegration.expiresAt = this.expiresAtFromSeconds(expires_in);
    googleIntegration.scope = scope;

    await googleIntegration.save();
    return access_token;
  }

  // Step 3: Get access token and refresh if needed
  async getAccessToken(userId: string) {
    console.log('Fetching access token for userId:', userId); // Log the userId
    const googleIntegration = await this.googleIntegrationModel.findOne({
      userId,
    });
    if (!googleIntegration) throw new Error('Google integration not found.');

    return await this.refreshIfExpired(googleIntegration._id.toString());
  }

  // Step 4: Fetch Gmail emails using access token
  async fetchEmails(accessToken: string): Promise<any[]> {
    const auth = this.oauth2Client;
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth });

    // Step 1: List the message IDs
    const { data } = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10, // Adjust the number of emails as needed
    });

    const messages = data.messages || [];
    const emails = [];

    // Step 2: Fetch the full details of each message
    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      const headers = email.data.payload.headers;
      const subject = headers.find(
        (header) => header.name === 'Subject',
      )?.value;
      const from = headers.find((header) => header.name === 'From')?.value;

      // Step 3: Extract the email body
      let body = '';
      const parts = email.data.payload.parts || [];

      // Check if the email has parts and get the body
      for (const part of parts) {
        if (part.mimeType === 'text/plain') {
          body = part.body?.data || '';
        } else if (part.mimeType === 'text/html') {
          // For HTML content, you can choose to extract that as well
          body = part.body?.data || '';
        }
      }

      // Decode the base64url encoded content
      body = Buffer.from(body, 'base64').toString('utf-8');

      emails.push({ subject, from, body });
    }

    return emails;
  }

  // async fetchEmails(accessToken: string): Promise<any[]> {
  //   const auth = this.oauth2Client;
  //   auth.setCredentials({ access_token: accessToken });

  //   const gmail = google.gmail({ version: 'v1', auth });

  //   const { data } = await gmail.users.messages.list({
  //     userId: 'me',
  //     maxResults: 10, // Adjust as needed
  //   });

  //   const messages = data.messages || [];
  //   const emails = [];

  //   for (const message of messages) {
  //     const email = await gmail.users.messages.get({
  //       userId: 'me',
  //       id: message.id,
  //     });

  //     const headers = email.data.payload.headers;
  //     const subject = headers.find(
  //       (header) => header.name === 'Subject',
  //     )?.value;
  //     const from = headers.find((header) => header.name === 'From')?.value;

  //     emails.push({ subject, from });
  //   }

  //   return emails;
  // }

  // Method to generate the Google OAuth URL
  public getAuthUrl(userId: string): string {
    const redirectUri = 'http://localhost:5000/api/google/auth/callback';

    // Make sure the userId is included in the URL to be passed in the callback
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      redirect_uri: redirectUri, // Ensure this is a different URL from the `auth` route
      state: userId, // Use `state` to pass the userId
    });
  }
}
