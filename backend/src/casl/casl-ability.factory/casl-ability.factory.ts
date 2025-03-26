import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';
import { Ingestion } from 'src/ingestion/entities/ingestion.entity';
import { PermissionEnum } from 'src/role/enums/permissions.enum';

import { User } from 'src/user/entities/user.entity';

export type Subjects =
  | InferSubjects<typeof User | typeof Document | typeof Ingestion>
  | 'all';

export type AppAbility = PureAbility<[PermissionEnum, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthenticatedUser) {
    const { can, cannot, build } = new AbilityBuilder<
      PureAbility<[PermissionEnum, Subjects]>
    >(PureAbility as AbilityClass<AppAbility>);
    console.log('Creating ability for user:', user.role);
    user.permissions.map((permission: PermissionEnum | 'all') => {
      if (permission === 'all') return can(PermissionEnum.MANAGE, 'all');
      can(permission, 'all');
    });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
