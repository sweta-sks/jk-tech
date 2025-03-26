import { Provider } from '@nestjs/common';
import { INGESTION_PROVIDER } from './constant';
import { DataSource } from 'typeorm';
import { DATABASE_PROVIDER } from './database/constant';
import { Ingestion } from './entity/ingestion.entity';

export const IngestionProver: Provider = {
  provide: INGESTION_PROVIDER,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Ingestion),
  inject: [DATABASE_PROVIDER],
};
