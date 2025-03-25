import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATABASE_PROVIDER } from 'src/database/constant';
import { USER_PROVIDER } from './constant';
import { User } from './entities/user.entity';

export const UserProvider: Provider = {
  provide: USER_PROVIDER,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
  inject: [DATABASE_PROVIDER],
};
