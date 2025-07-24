import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypegooseModule } from 'nestjs-typegoose';
import { UserModule } from './product-catalog/product-catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypegooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        // console.log('MongoDB URI from config:', uri); // <-- log here
        return {
          uri,
        };
      },
    }),

    UserModule,
  ],
})
export class AppModule {}
