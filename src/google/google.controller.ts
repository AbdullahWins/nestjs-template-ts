import { Controller, Get, Query, Redirect, Param } from '@nestjs/common';
import { GoogleService } from './google.service';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  // Step 1: Redirect to Google OAuth2 for user login
  @Get('auth')
  @Redirect()
  async redirectToGoogle(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('userId is required');
    }

    console.log('Redirecting with userId:', userId); // Log the userId
    const authUrl = this.googleService.getAuthUrl(userId); // Pass userId to the service
    console.log('authUrl', authUrl);
    return { url: authUrl }; // Redirect the user to Google for OAuth
  }

  // Step 2: Handle Google OAuth2 callback and save tokens
  @Get('auth/callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') userId: string, // Extract `state` parameter (which is the `userId`)
  ) {
    try {
      console.log('Received userId:', userId);
      console.log('Received code:', code);

      if (!userId) {
        return { message: 'Error: userId is missing in the query parameters.' };
      }

      if (!code) {
        return { message: 'Error: No code received from Google OAuth' };
      }

      const googleIntegration = await this.googleService.save(userId, code);
      return { message: 'Gmail integration successful!', googleIntegration };
    } catch (error) {
      console.error('Error during OAuth callback:', error);
      return { message: 'Internal server error', error: error.message };
    }
  }

  // @Get('auth/callback')
  // async handleCallback(
  //   @Query('code') code: string,
  //   @Query('state') userId: string, // Extract `state` parameter (which is the `userId`)
  // ) {
  //   try {
  //     if (!userId) {
  //       return { message: 'Error: userId is missing in the query parameters.' };
  //     }

  //     if (!code) {
  //       return { message: 'Error: No code received from Google OAuth' };
  //     }

  //     // Pass the userId and code to save the googleIntegration
  //     const googleIntegration = await this.googleService.save(userId, code);
  //     return { message: 'Gmail integration successful!', googleIntegration };
  //   } catch (error) {
  //     console.error('Error during OAuth callback:', error);
  //     return { message: 'Internal server error', error: error.message };
  //   }
  // }

  // Step 3: Fetch Gmail emails for a user
  // @Get('emails')
  // async getEmails(@Query('userId') userId: string) {
  //   const accessToken = await this.googleService.getAccessToken(userId);
  //   const emails = await this.googleService.fetchEmails(accessToken);
  //   return emails;
  // }

  @Get('emails/:userId')
  async getEmails(@Param('userId') userId: string) {
    try {
      // Get the access token for the given userId
      const accessToken = await this.googleService.getAccessToken(userId);

      // Fetch the user's emails using the access token
      const emails = await this.googleService.fetchEmails(accessToken);

      return { success: true, emails };
    } catch (error) {
      console.error('Error fetching emails:', error);
      return {
        success: false,
        message: 'Failed to fetch emails.',
        error: error.message,
      };
    }
  }
}
