import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(
    private readonly customMessage: string = 'Internal server error', // Default to 'Internal server error'
    private readonly customStatus: number = HttpStatus.INTERNAL_SERVER_ERROR, // Default to 500
  ) {
    super(customMessage, customStatus);
  }

  getCustomMessage(): string {
    return this.customMessage;
  }

  getCustomStatus(): number {
    return this.customStatus;
  }
}
