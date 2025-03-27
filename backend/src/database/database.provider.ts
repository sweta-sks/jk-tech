import { HttpException, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DATABASE_PROVIDER } from './constant';

// Import your entities
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';

import { Document } from '../document/entities/document.entity';

export const databaseProviders: Provider[] = [
  {
    provide: DATABASE_PROVIDER,
    useFactory: async (configService: ConfigService): Promise<DataSource> => {
      try {
        const dbConfig = configService.get('database');
        console.log(dbConfig);
        const dataSource = new DataSource({
          type: 'postgres',
          host: dbConfig.host || 'localhost',
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          synchronize: dbConfig.sync,
          logging: dbConfig.logging,
          entities: [User, Role, Document],
        });

        return dataSource.initialize();
      } catch (e) {
        throw new Error(e.message);
      }
    },
    inject: [ConfigService],
  },
];
