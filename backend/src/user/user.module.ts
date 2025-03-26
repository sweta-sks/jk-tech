import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProvider } from './user.provider';
import { RoleModule } from 'src/role/role.module';
import { RoleService } from 'src/role/role.service';
@Global()
@Module({
  controllers: [UserController],
  providers: [UserService, UserProvider],
  imports: [RoleModule],
  exports: [UserService],
})
export class UserModule {}
