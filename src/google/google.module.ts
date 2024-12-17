import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleIntegrationSchema } from './schemas/integration.google.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'GoogleIntegration', schema: GoogleIntegrationSchema },
    ]),
  ],
  controllers: [GoogleController],
  providers: [GoogleService],
})
export class GoogleModule {}
