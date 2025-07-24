import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { TypegooseModule } from 'nestjs-typegoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './authentication/auth/auth.module';
import { AppLoggerModule } from './authentication/logger/app-logger.module';
import { UserModule } from './modules/user/user.module';
import { MongooseConfigModule } from './authentication/auth/config/mongoose-config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypegooseModule.forRootAsync({
      imports: [MongooseConfigModule, ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const mongoUri = config.get<string>('MONGO_URI');
        // console.log('MONGO_URI from ConfigService:', mongoUri);

        return {
          uri: mongoUri,
        };
      },
    }),

    //module prefix for modules
    RouterModule.register([]),
    MulterModule.register({ dest: './uploads', storage: './uploads' }),
    AuthModule,
    UserModule,
    AppLoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
