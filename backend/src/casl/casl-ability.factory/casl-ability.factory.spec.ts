import { CaslAbilityFactory } from './casl-ability.factory';
import { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';
import { PermissionEnum } from '../../role/enums/permissions.enum';

describe('CaslAbilityFactory - Permission-Based Testing', () => {
  let caslAbilityFactory: CaslAbilityFactory;

  beforeEach(() => {
    caslAbilityFactory = new CaslAbilityFactory();
  });

  it('should allow only READ permission when user has READ', () => {
    const user: AuthenticatedUser = {
      id: 'user1',
      email: 'reader@example.com',
      role: 'custom-role',
      permissions: [PermissionEnum.READ],
    };

    const ability = caslAbilityFactory.createForUser(user);

    expect(ability.can(PermissionEnum.READ, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.CREATE, 'all')).toBe(false);
    expect(ability.can(PermissionEnum.UPDATE, 'all')).toBe(false);
    expect(ability.can(PermissionEnum.DELETE, 'all')).toBe(false);
  });

  it('should allow CREATE and UPDATE permissions but not DELETE', () => {
    const user: AuthenticatedUser = {
      id: 'user2',
      email: 'editor@example.com',
      role: 'custom-role',
      permissions: [PermissionEnum.CREATE, PermissionEnum.UPDATE],
    };

    const ability = caslAbilityFactory.createForUser(user);

    expect(ability.can(PermissionEnum.CREATE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.UPDATE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.READ, 'all')).toBe(false);
    expect(ability.can(PermissionEnum.DELETE, 'all')).toBe(false);
  });

  it('should allow full permissions when "manage" is granted', () => {
    const user: AuthenticatedUser = {
      id: 'user3',
      email: 'admin@example.com',
      role: 'super-admin',
      permissions: [PermissionEnum.MANAGE],
    };

    const ability = caslAbilityFactory.createForUser(user);

    expect(ability.can(PermissionEnum.MANAGE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.CREATE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.READ, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.UPDATE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.DELETE, 'all')).toBe(true);
  });

  it('should deny all permissions when user has an empty permissions array', () => {
    const user: AuthenticatedUser = {
      id: 'user4',
      email: 'guest@example.com',
      role: 'guest',
      permissions: [],
    };

    const ability = caslAbilityFactory.createForUser(user);

    expect(ability.can(PermissionEnum.CREATE, 'all')).toBe(false);
    expect(ability.can(PermissionEnum.READ, 'all')).toBe(false);
    expect(ability.can(PermissionEnum.UPDATE, 'all')).toBe(false);
    expect(ability.can(PermissionEnum.DELETE, 'all')).toBe(false);
    expect(ability.can(PermissionEnum.MANAGE, 'all')).toBe(false);
  });

  it('should grant all specific permissions when user has them explicitly', () => {
    const user: AuthenticatedUser = {
      id: 'user5',
      email: 'full-access@example.com',
      role: 'manager',
      permissions: [
        PermissionEnum.CREATE,
        PermissionEnum.READ,
        PermissionEnum.UPDATE,
        PermissionEnum.DELETE,
      ],
    };

    const ability = caslAbilityFactory.createForUser(user);

    expect(ability.can(PermissionEnum.CREATE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.READ, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.UPDATE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.DELETE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.MANAGE, 'all')).toBe(false);
  });

  it('should allow all permissions when user has only MANAGE', () => {
    const user: AuthenticatedUser = {
      id: 'user6',
      email: 'manager@example.com',
      role: 'admin',
      permissions: [PermissionEnum.MANAGE],
    };

    const ability = caslAbilityFactory.createForUser(user);

    expect(ability.can(PermissionEnum.MANAGE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.CREATE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.READ, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.UPDATE, 'all')).toBe(true);
    expect(ability.can(PermissionEnum.DELETE, 'all')).toBe(true);
  });
});
