import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { LinkedInIntegration } from './schemas/integration.linkedin.schema';

@Injectable()
export class LinkedInService {
  constructor(
    @InjectModel('LinkedInIntegration')
    private readonly linkedInIntegrationModel: Model<LinkedInIntegration>,
  ) {}

  private expiresAtFromSeconds(seconds: number) {
    return new Date(Date.now() + seconds * 1000);
  }

  // Step 1: Generate LinkedIn OAuth URL
  public getAuthUrl(userId: string): string {
    const linkedInClientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = 'http://localhost:5000/api/linkedin/auth/callback';

    // Include the openid, profile, and email scopes
    const scope = 'openid profile email';

    const state = userId; // Use state to pass the userId

    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedInClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
  }

  // Step 2: Handle callback and save tokens
  async save(userId: string, code: string) {
    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, expires_in, error, id_token } = response.data;
    if (error) throw new Error('LinkedIn OAuth Error: ' + error);

    // Store only relevant data
    const linkedInIntegration = new this.linkedInIntegrationModel({
      userId,
      accessToken: access_token,
      refreshToken: null, // LinkedIn doesn't always provide a refresh token
      expiresAt: this.expiresAtFromSeconds(expires_in),
      idToken: id_token || null, // Save idToken if needed
    });

    console.log('Saving LinkedIn integration:', linkedInIntegration);
    await linkedInIntegration.save();
    return linkedInIntegration;
  }

  // Step 3: Get access token for a user
  async getAccessToken(userId: string): Promise<string> {
    // Fetch the LinkedIn integration for the user
    const linkedInIntegration = await this.linkedInIntegrationModel.findOne({
      userId,
    });

    if (!linkedInIntegration) {
      throw new Error('LinkedIn integration not found.');
    }

    // Check if the access token is expired and refresh if necessary
    if (linkedInIntegration.expiresAt <= new Date()) {
      throw new Error(
        'Access token expired. LinkedIn does not provide a refresh token.',
      );
      // If refresh tokens are supported in your app, implement the refresh logic here.
    }

    return linkedInIntegration.accessToken;
  }

  // Step 4: Refresh tokens if expired (optional for LinkedIn)
  async refreshIfExpired(linkedInIntegrationId: string) {
    const linkedInIntegration = await this.linkedInIntegrationModel.findById(
      linkedInIntegrationId,
    );
    if (!linkedInIntegration)
      throw new Error('LinkedIn integration not found.');

    if (linkedInIntegration.expiresAt > new Date())
      return linkedInIntegration.accessToken;

    throw new Error('LinkedIn tokens cannot be refreshed automatically.');
  }

  // Step 5: Fetch user data from LinkedIn API
  async fetchUserData(accessToken: string): Promise<any> {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }
}
