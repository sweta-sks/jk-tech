import { Global, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleProvider } from './role.provider';
import { databaseProviders } from '../database/database.provider';

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleProvider, ...databaseProviders],
  exports: [RoleService],
})
export class RoleModule {}
