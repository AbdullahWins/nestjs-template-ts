import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationSchema } from './schemas/integration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Integration', schema: IntegrationSchema },
    ]),
  ],
  controllers: [GoogleController],
  providers: [GoogleService],
})
export class GoogleModule {}
