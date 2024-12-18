// controllers/linkedin.controller.ts
import { Controller, Get, Query, Redirect, Param } from '@nestjs/common';
import { LinkedInService } from './linkedin.service';

@Controller('linkedin')
export class LinkedInController {
  constructor(private readonly linkedInService: LinkedInService) {}

  @Get('auth')
  @Redirect()
  async redirectToLinkedIn(@Query('userId') userId: string) {
    if (!userId) throw new Error('userId is required');
    const authUrl = this.linkedInService.getAuthUrl(userId);
    console.log('authUrl', authUrl);
    return { url: authUrl };
  }

  @Get('auth/callback')
  async handleCallback(@Query() queryParams: Record<string, string>) {
    console.log('Received query parameters:', queryParams);
    const code = queryParams['code'];
    const userId = queryParams['state'];

    try {
      if (!userId) throw new Error('Missing userId in state parameter.');
      if (!code) throw new Error('Missing authorization code.');

      const linkedInIntegration = await this.linkedInService.save(userId, code);
      return {
        message: 'LinkedIn integration successful!',
        linkedInIntegration,
      };
    } catch (error) {
      console.error('LinkedIn OAuth callback error:', error);
      return {
        message: 'Error during LinkedIn integration',
        error: error.message,
      };
    }
  }

  @Get('user/:userId')
  async getUserData(@Param('userId') userId: string) {
    try {
      const accessToken = await this.linkedInService.getAccessToken(userId);
      const userData = await this.linkedInService.fetchUserData(accessToken);
      return { success: true, userData };
    } catch (error) {
      console.error('Error fetching LinkedIn user data:', error);
      return {
        success: false,
        message: 'Error fetching user data.',
        error: error.message,
      };
    }
  }
}
