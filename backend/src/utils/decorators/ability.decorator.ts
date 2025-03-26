import { SetMetadata } from '@nestjs/common';
import { Subjects } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { PermissionEnum } from 'src/role/enums/permissions.enum';

export interface RequiredRule {
  action: PermissionEnum;
  subject: Subjects;
}

export const CHECK_ABILITIES_KEY = 'check_abilities';

export const CheckAbilities = (...abilities: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITIES_KEY, abilities);
