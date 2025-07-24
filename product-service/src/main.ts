import {
  BadRequestException,
  Logger,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger/dist';
import { ValidationError } from 'class-validator';
import * as express from 'express';
import * as basicAuth from 'express-basic-auth';
import { Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { AppModule } from './app.module';
import { GlobalResponseInterceptor } from './common/response/global-response.interceptor';

const SWAGGER_ENVS = ['development', 'local'];

async function bootstrap() {
  initializeTransactionalContext(); 
  patchTypeORMRepositoryWithBaseRepository(); 

  const app = await NestFactory.create(AppModule, {
    logger: new Logger('ApplicationStartUp'),
  });
  const reflector = app.get(Reflector);
  app.use(function (
    req: { headers: { origin: any; host: any } },
    res: any,
    next: () => void,
  ) {
    req.headers.origin = req.headers.origin || req.headers.host;
    res.set({ 'X-Powered-By': 'SMS' });
    next();
  });

  app.use(express.urlencoded({ extended: true }));

  const options = {
    origin: 'http://127.0.0.1:3000',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS,PATCH',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  app.enableCors(options);
  //set basic auth for accessing swagger api
  if (SWAGGER_ENVS.includes(process.env.NODE_ENV || 'development')) {
    app.use(
      ['/apidoc'],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
        },
      }),
    );
  }
  //setting the global prefix for routing and versiong routes
  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },

      // exception factory for custom validation error message as key value pair
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const response_data = {};

        validationErrors.filter(function (values) {
          if (values.children && values.children.length > 0) {
            values.children.map((element) => {
              if (element.children && element.children.length > 0) {
                //check for multi level validation error message
                element.children.map((elementNext) => {
                  response_data[elementNext.property] = [];
                  Object.keys(elementNext.constraints).map((k) => {
                    response_data[elementNext.property].push(
                      elementNext.constraints[k],
                    );
                  });
                });
              } else {
                response_data[element.property] = [];
                Object.keys(element.constraints).map((k) => {
                  response_data[element.property].push(element.constraints[k]);
                });
              }
            });
          } else {
            response_data[values.property] = Object.keys(
              values.constraints,
            ).map((k) => values.constraints[k]);
          }
        });

        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: Object.values(response_data)
            .flat()
            .map((errorMessage: string) => {
              return (
                errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
              );
            }),
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('PS')
    .setDescription('Product Service Backend API')
    .setVersion('1.0')
    .setLicense('PS', 'https://ps.com/')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Token',
        in: 'header',
      },
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidoc', app, document);

  //global response interceptor
  app.useGlobalInterceptors(new GlobalResponseInterceptor());

  //configure app port
  const app_port = parseInt(process.env.APP_PORT) || 3000;
  //start app server
  await app.listen(app_port);
  //log application startup
  Logger.log(`Application is running on port: ${app_port}`);
  Logger.log(`🔥 Server running at http://localhost:${app_port}`);
  Logger.log(
    `🔥 Api doc server started at http://localhost:${app_port}/apidoc`,
  );

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'auth_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
