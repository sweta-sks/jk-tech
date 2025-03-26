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
  async addUserToRole(userId: string, roleName: RoleEnum) {
    try {
      const role = await this.roleRepository.findOne({
        where: {
          name: roleName,
        },
      });

      if (!role) {
        throw new Error('Role not found');
      }
      const user = new User();
      user.id = userId;
      role.users.push(user);
      return this.roleRepository.save(role);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async findAll() {
    try {
      return await this.roleRepository.find();
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
