import { Module } from '@nestjs/common';
import { MicrosoftController } from './microsoft.controller';
import { MicrosoftService } from './microsoft.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MicrosoftIntegrationSchema } from './schemas/integration.microsoft.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MicrosoftIntegration', schema: MicrosoftIntegrationSchema },
    ]),
  ],
  controllers: [MicrosoftController],
  providers: [MicrosoftService],
})
export class MicrosoftModule {}
