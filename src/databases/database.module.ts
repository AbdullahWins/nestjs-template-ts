import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `${process.env.MONGOOSE_URI}/${process.env.DATABASE_NAME}`,
    ),
  ],
})
export class DatabaseModule {}
