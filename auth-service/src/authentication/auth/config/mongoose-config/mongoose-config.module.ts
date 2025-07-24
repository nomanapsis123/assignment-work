// database/mongoose-config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseConfigService } from './mongoose-config.service';

@Module({
  imports: [ConfigModule],
  providers: [MongooseConfigService],
  exports: [MongooseConfigService],
})
export class MongooseConfigModule {}
