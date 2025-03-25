export const RoleEnum = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
} as const;

export type RoleEnum = (typeof RoleEnum)[keyof typeof RoleEnum];

export const RoleEnumList = Object.values(RoleEnum);
