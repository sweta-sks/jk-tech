import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATABASE_PROVIDER } from 'src/database/constant';
import { ROLES_PROVIDER } from './constant';
import { Role } from './entities/role.entity';

export const RoleProvider: Provider = {
  provide: ROLES_PROVIDER,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Role),
  inject: [DATABASE_PROVIDER],
};
