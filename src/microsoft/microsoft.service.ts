import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MicrosoftIntegration } from './schemas/integration.microsoft.schema';

@Injectable()
export class MicrosoftService {
  private readonly clientId: string = process.env.MICROSOFT_CLIENT_ID;
  private readonly clientSecret: string = process.env.MICROSOFT_CLIENT_SECRET;
  private readonly redirectUri: string = process.env.MICROSOFT_REDIRECT_URI;
  private readonly tenantId: string = process.env.MICROSOFT_TENANT_ID;

  constructor(
    @InjectModel('MicrosoftIntegration')
    private readonly microsoftIntegrationModel: Model<MicrosoftIntegration>,
  ) {}

  // Generate the Microsoft OAuth URL
  public getAuthUrl(userId: string): string {
    const authUrl =
      `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?` +
      `client_id=${this.clientId}&` +
      `response_type=code&` +
      `redirect_uri=${this.redirectUri}&` +
      `response_mode=query&` +
      `scope=mail.read user.read offline_access&` +
      `state=${userId}`; // Pass userId to map tokens to users
    return authUrl;
  }

  // Save the access token after OAuth2 callback
  async save(userId: string, code: string) {
    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }).toString(), // Convert to URL encoded string
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token, refresh_token, expires_in, scope } = response.data;

      const newMicrosoftIntegration = new this.microsoftIntegrationModel({
        userId,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        scope,
      });

      await newMicrosoftIntegration.save();
      return newMicrosoftIntegration;
    } catch (error) {
      console.error(
        'Full error during token exchange:',
        error.response?.data || error.message,
      );
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error('Failed to exchange code for access token');
    }
  }

  // Refresh access token if expired
  async refreshIfExpired(microsoftIntegrationId: string) {
    const microsoftIntegration = await this.microsoftIntegrationModel.findById(
      microsoftIntegrationId,
    );
    if (!microsoftIntegration) throw new Error('Integration not found.');

    if (microsoftIntegration.expiresAt > new Date())
      return microsoftIntegration.accessToken;

    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: microsoftIntegration.refreshToken,
          grant_type: 'refresh_token',
          redirect_uri: this.redirectUri,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const { access_token, expires_in } = response.data;

      microsoftIntegration.accessToken = access_token;
      microsoftIntegration.expiresAt = new Date(Date.now() + expires_in * 1000);

      await microsoftIntegration.save();
      return access_token;
    } catch (error) {
      console.error(
        'Error refreshing access token:',
        error.response?.data || error.message,
      );
      if (error.response?.data?.error === 'invalid_grant') {
        throw new Error(
          'Refresh token is invalid or expired. Please re-authenticate.',
        );
      }
      throw new Error('Failed to refresh access token.');
    }
  }

  // Fetch emails from Microsoft Graph API
  async fetchEmails(accessToken: string): Promise<any[]> {
    try {
      console.log(
        'Fetching emails with access token:',
        accessToken.slice(0, 20) + '...',
      ); // Partial token logging

      const response = await axios.get(
        'https://graph.microsoft.com/v1.0/me/messages',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          params: {
            $top: 10, // Adjust the number of emails as needed
            $select: 'subject,from,bodyPreview', // Reduce data to minimize potential issues
          },
        },
      );

      const emails = response.data.value.map((email) => ({
        subject: email.subject,
        from: email.from?.emailAddress?.address || 'Unknown',
        body: email.bodyPreview || 'No preview available',
      }));

      return emails;
    } catch (error) {
      console.error('Full error details when fetching emails:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }

      throw new Error(`Failed to fetch emails: ${error.message}`);
    }
  }

  // Get access token and refresh if expired
  async getAccessToken(userId: string) {
    const microsoftIntegration = await this.microsoftIntegrationModel.findOne({
      userId,
    });

    if (!microsoftIntegration)
      throw new Error('Microsoft integration not found.');

    // Force refresh if token is close to expiration or expired
    if (
      !microsoftIntegration.expiresAt ||
      microsoftIntegration.expiresAt <= new Date()
    ) {
      try {
        return await this.refreshIfExpired(microsoftIntegration._id.toString());
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error(
          'Unable to refresh access token. Please re-authenticate.',
        );
      }
    }

    return microsoftIntegration.accessToken;
  }
}
