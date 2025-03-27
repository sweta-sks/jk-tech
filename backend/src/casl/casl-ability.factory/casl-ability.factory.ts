import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';
import { Ingestion } from '../../ingestion/entities/ingestion.entity';
import { PermissionEnum } from '../../role/enums/permissions.enum';

import { User } from '../../user/entities/user.entity';

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
