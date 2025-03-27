import { Provider } from '@nestjs/common';
import { DOCUMENT_PROVIDER } from './constant';
import { DataSource } from 'typeorm';
import { Document } from './entities/document.entity';
import { DATABASE_PROVIDER } from '../database/constant';

export const DocumentProvider: Provider = {
  provide: DOCUMENT_PROVIDER,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Document),
  inject: [DATABASE_PROVIDER],
};
