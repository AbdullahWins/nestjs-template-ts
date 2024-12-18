import { Module } from '@nestjs/common';
import { LinkedInController } from './linkedin.controller';
import { LinkedInService } from './linkedin.service';
import { LinkedInIntegrationSchema } from './schemas/integration.linkedin.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'LinkedInIntegration', schema: LinkedInIntegrationSchema },
    ]),
  ],
  controllers: [LinkedInController],
  providers: [LinkedInService],
})
export class LinkedinModule {}
