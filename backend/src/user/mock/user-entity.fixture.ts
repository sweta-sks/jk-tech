import { permission } from 'process';
import { User } from '../entities/user.entity';
import { AuthenticatedUser } from '@src/auth/strategies/jwt.strategy';

export const mockUserEntity: User = {
  id: 'fbb0e350-36b4-4e69-ba30-3be43d216c4d',
  name: 'string',
  email: 'user@example.com',
  password: 'string',
  createdAt: new Date('2025-03-27T10:15:31.682Z'),
  updatedAt: new Date('2025-03-27T10:15:31.682Z'),
  role: {
    id: 'e2676c70-faef-4c61-b285-bdd75abcbd71',
    name: 'ADMIN',
    permissions: ['manage'],
  },
};

export const mockCurrentUser: AuthenticatedUser = (() => {
  const { password, role, ...rest } = mockUserEntity;
  return {
    ...rest,
    role: role.name,
    permissions: role.permissions,
  };
})();
