import { Controller, Get, Query, Param, Redirect } from '@nestjs/common';
import { MicrosoftService } from './microsoft.service';

@Controller('microsoft')
export class MicrosoftController {
  constructor(private readonly microsoftService: MicrosoftService) {}

  // Redirect to Microsoft OAuth2 login
  @Get('auth')
  @Redirect()
  async redirectToMicrosoft(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('userId is required');
    }

    const authUrl = this.microsoftService.getAuthUrl(userId);
    console.log('authUrl', authUrl);
    return { url: authUrl };
  }

  // Handle Microsoft OAuth2 callback
  @Get('auth/callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') userId: string,
  ) {
    try {
      if (!code || !userId) {
        return {
          message: 'Error: Missing code or userId in the query parameters.',
        };
      }

      const microsoftIntegration = await this.microsoftService.save(
        userId,
        code,
      );
      return {
        message: 'Microsoft integration successful!',
        microsoftIntegration,
      };
    } catch (error) {
      console.error('Error during OAuth callback:', error);
      return { message: 'Error during OAuth callback', error: error.message };
    }
  }

  // Get emails for a user
  @Get('emails/:userId')
  async getEmails(@Param('userId') userId: string) {
    try {
      const accessToken = await this.microsoftService.getAccessToken(userId);

      // Debug logging
      console.log('Access Token Scopes:', this.decodeTokenScopes(accessToken));

      const emails = await this.microsoftService.fetchEmails(accessToken);
      return { success: true, emails };
    } catch (error) {
      console.error('Email Fetch Failure:', error);
      return {
        success: false,
        message: 'Failed to fetch emails.',
        error: error.message,
      };
    }
  }

  // Optional helper method to decode token scopes
  private decodeTokenScopes(token: string): string[] {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      const payload = JSON.parse(
        Buffer.from(base64, 'base64').toString('utf-8'),
      );
      return payload.scp ? payload.scp.split(' ') : [];
    } catch {
      return [];
    }
  }
}
