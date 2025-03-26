import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { INGESTION_PROVIDER } from './constant';

export const IngestionProvider: Provider[] = [
  {
    provide: INGESTION_PROVIDER,
    useFactory: (configService: ConfigService) => {
      const config = configService.get('ingestionService.rabbit');

      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [config.url],
          queue: config.queue,
          queueOptions: {
            durable: true,
          },
        },
      });
    },
    inject: [ConfigService],
  },
];
