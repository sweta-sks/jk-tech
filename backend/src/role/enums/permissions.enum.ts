export const PermissionEnum = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;

export type PermissionEnum =
  (typeof PermissionEnum)[keyof typeof PermissionEnum];

export const PermissionEnumList = Object.values(PermissionEnum);
