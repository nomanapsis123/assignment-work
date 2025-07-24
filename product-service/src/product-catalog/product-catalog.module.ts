import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { ProductCatalog } from './product-catalog.model';
import { ProductCatalogController } from './product-catalog.controller';
import { ProductCatalogService } from './product-catalog.service';
import { ClientsModule, Transport } from '@nestjs/microservices';


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
    TypegooseModule.forFeature([ProductCatalog])],
  controllers: [ProductCatalogController],
  providers: [ProductCatalogService],
})
export class UserModule {}
