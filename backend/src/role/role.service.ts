import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ROLES_PROVIDER } from './constant';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { DefaultRoleSetting } from './default-role.setting';
import { RoleEnum } from './enums/roles.enum';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(
    @Inject(ROLES_PROVIDER)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async onModuleInit() {
    const defaultRoles = DefaultRoleSetting();
    const roles = await this.roleRepository.find();

    if (roles.length === 0) {
      await this.roleRepository.save(defaultRoles);
    }
  }

  async getRoleByName(name: RoleEnum): Promise<Role> {
    return this.roleRepository.findOne({ where: { name } });
  }
}
