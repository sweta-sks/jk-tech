// import {
//   AbilityBuilder,
//   AbilityClass,
//   ExtractSubjectType,
//   InferSubjects,
//   PureAbility,
// } from '@casl/ability';
// import { Injectable } from '@nestjs/common';

// import { User } from 'src/user/entities/user.entity';
// import { AuthenticatedUser } from 'src/utils/strategies/jwt.strategy';

// export type Subjects =
//   | InferSubjects<
//       | typeof User
//       | typeof File
//       | typeof Org
//       | typeof Group
//       | typeof Role
//       | ClaimEnum
//     >
//   | 'all';

// export type AppAbility = PureAbility<[PermissionEnum, Subjects]>;

// @Injectable()
// export class CaslAbilityFactory {
//   createForUser(user: AuthenticatedUser) {
//     const { can, cannot, build } = new AbilityBuilder<
//       PureAbility<[PermissionEnum, Subjects]>
//     >(PureAbility as AbilityClass<AppAbility>);

//     if (user.role === 'guest') {
//       const claim = user.claim;
//       if (
//         claim === ClaimEnum.SIGN ||
//         claim === ClaimEnum.PASSWORDLESS ||
//         claim === ClaimEnum.VIEW
//       ) {
//         user.permissions.forEach((permission: PermissionEnum) => {
//           can(permission, claim);
//         });
//       }

//       can(PermissionEnum.CREATE, File);

//       return build({
//         detectSubjectType: (item) =>
//           item.constructor as ExtractSubjectType<Subjects>,
//       });
//     } else if (user.role === 'system') {
//       can(PermissionEnum.MANAGE, 'all');
//       return build({
//         detectSubjectType: (item) =>
//           item.constructor as ExtractSubjectType<Subjects>,
//       });
//     }

//     const claim = user.claim;

//     if (claim === ClaimEnum.SET_PASSWORD) {
//       can(PermissionEnum.CREATE, claim);
//     }

//     user.permissions.map((permission: PermissionEnum | 'all') => {
//       if (permission === 'all') return can(PermissionEnum.MANAGE, 'all');
//       can(permission, 'all');
//       cannot(permission, ClaimEnum.SYSTEM);
//     });

//     return build({
//       detectSubjectType: (item) =>
//         item.constructor as ExtractSubjectType<Subjects>,
//     });
//   }
// }
