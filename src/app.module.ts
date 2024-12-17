import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './databases/database.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleModule } from './google/google.module';
import { MicrosoftModule } from './microsoft/microsoft.module';

@Module({
  imports: [DatabaseModule, UsersModule, ConfigModule.forRoot(), GoogleModule, MicrosoftModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
