import { HttpException, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DATABASE_PROVIDER } from './constant';
import { Ingestion } from 'src/entity/ingestion.entity';

export const databaseProviders: Provider[] = [
  {
    provide: DATABASE_PROVIDER,
    useFactory: async (configService: ConfigService): Promise<DataSource> => {
      try {
        const dbConfig = configService.get('database');

        const dataSource = new DataSource({
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          synchronize: dbConfig.sync,
          logging: dbConfig.logging,
          entities: [Ingestion],
        });

        return dataSource.initialize();
      } catch (e) {
        throw new Error(e.message);
      }
    },
    inject: [ConfigService],
  },
];
