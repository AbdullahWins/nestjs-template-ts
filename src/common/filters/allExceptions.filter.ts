import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '@exceptions/customException.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle CustomException with a custom message and status
    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message || 'Something went wrong';
    } else if (exception instanceof CustomException) {
      status = exception.getCustomStatus();
      message = exception.getCustomMessage();
    } else {
      status = 500; // Internal server error for unknown exceptions
      message = 'Internal server error';
    }

    response.status(status).json({
      status: status,
      success: false,
      data: null,
      message: message,
    });
  }
}
