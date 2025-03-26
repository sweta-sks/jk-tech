import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
const port = process.env.PORT || 4000;
async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.RMQ,
  //     options: {
  //       urls: ['amqp://jktech:rabbitMq@localhost:5672'],
  //       queue: process.env.RABBITMQ_QUEUE,
  //       queueOptions: {
  //         durable: true,
  //       },
  //     },
  //   },
  // );

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const config = configService.get('rabbit');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.url],
      queue: config.queue,
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
