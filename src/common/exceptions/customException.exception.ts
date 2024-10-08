import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(
    private readonly customMessage: string = 'Something went wrong', // Default to 'Something went wrong'
    private readonly customStatus: number = HttpStatus.BAD_REQUEST, // Default to 400
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
