import { PermissionEnum } from './enums/permissions.enum';
import { RoleEnum, RoleEnumList } from './enums/roles.enum';

export const DefaultRoleSetting = () => {
  return RoleEnumList.map((role) => {
    if (role === RoleEnum.ADMIN) {
      return {
        name: role,
        permissions: [PermissionEnum.MANAGE],
      };
    }
    if (role === RoleEnum.EDITOR) {
      return {
        name: role,
        permissions: [
          PermissionEnum.CREATE,
          PermissionEnum.READ,
          PermissionEnum.UPDATE,
        ],
      };
    }

    if (role === RoleEnum.VIEWER) {
      return {
        name: role,
        permissions: [PermissionEnum.READ],
      };
    }

    return {
      name: role,
      permissions: [PermissionEnum.READ],
    };
  });
};
