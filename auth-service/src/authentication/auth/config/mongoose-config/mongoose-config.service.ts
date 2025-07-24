// database/mongoose-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseLogger } from './logger';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const uri = this.configService.get<string>('MONGO_URI') || this.buildUri();

    return {
      uri,
      connectionName: 'default',
    };
  }

  private buildUri(): string {
    const host = this.configService.get<string>('MONGO_DB_HOST');
    const port = this.configService.get<number>('MONGO_DB_PORT');
    const db = this.configService.get<string>('MONGO_DB');
    const user = this.configService.get<string>('MONGO_DB_USER');
    const pass = this.configService.get<string>('MONGO_DB_PASSWORD');

    return `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`;
  }
}
