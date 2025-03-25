import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DATABASE_PROVIDER } from './constant';

// Import your entities
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { Ingestion } from 'src/ingestion/entities/ingestion.entity';

import { Document } from 'src/document/entities/document.entity';

export const databaseProviders: Provider[] = [
  {
    provide: DATABASE_PROVIDER,
    useFactory: async (configService: ConfigService): Promise<DataSource> => {
      const dbConfig = configService.get('database');
      console.log({ dbConfig });
      const dataSource = new DataSource({
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.name,
        synchronize: dbConfig.sync,
        logging: dbConfig.logging,
        entities: [User, Role, Document],
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
