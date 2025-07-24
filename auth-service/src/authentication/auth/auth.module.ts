/**dependencies */
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
/**controllers */
import { AuthController } from './auth.controller';
/**services */
import { AuthService } from './auth.service';
/**Authentication strategies */
import { JwtModule } from '@nestjs/jwt';
import { TypegooseModule } from 'nestjs-typegoose';
import { UserModel } from 'src/modules/user/entities';
import { UserModule } from 'src/modules/user/user.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AtStrategy, RtStrategy } from './strategy';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'], // RabbitMQ URL
          queue: 'auth_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    TypegooseModule.forFeature([UserModel]),
    forwardRef(() => UserModule),
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('AT_SECRET'), // fallback config
        signOptions: { expiresIn: '10m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RtStrategy, AtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
