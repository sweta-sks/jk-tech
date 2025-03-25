import { Provider } from '@nestjs/common';
import { DATABASE_PROVIDER } from './constant';

export const databaseProviders: Provider[] = [
  {
    provide: DATABASE_PROVIDER,
    //postgresql: true
    useFactory: async () => {},
  },
];
