import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/allExceptions.filter';
import { MulterMiddleware } from './middlewares/multer.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Check if the environment is production
  const isProduction = process.env.NODE_ENV === 'production';

  // Set global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Register the global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Check if the environment is production
  if (isProduction) {
    // Register the global filter for production
    app.useGlobalFilters(new AllExceptionsFilter());
  }

  // Register the Multer middleware globally
  app.use(new MulterMiddleware().use);

  // Create application startup program
  const startServer = async () => {
    await app.listen(process.env.SERVER_PORT || 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  };

  // Start the application
  startServer();
}
bootstrap();
