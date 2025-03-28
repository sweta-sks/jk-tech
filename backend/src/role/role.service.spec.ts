import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DefaultRoleSetting } from './default-role.setting';
import { RoleEnum } from './enums/roles.enum';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: Repository<Role>;

  const mockRoleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: 'ROLES_PROVIDER',
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>('ROLES_PROVIDER');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize roles if none exist', async () => {
      mockRoleRepository.find.mockResolvedValueOnce([]);
      const defaultRoles = DefaultRoleSetting();
      mockRoleRepository.save.mockResolvedValueOnce(defaultRoles);

      await service.onModuleInit();

      expect(roleRepository.find).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalledWith(defaultRoles);
    });

    it('should not initialize roles if roles already exist', async () => {
      mockRoleRepository.find.mockResolvedValueOnce([
        { id: '1', name: 'Admin', permissions: [] },
      ]);

      await service.onModuleInit();

      expect(roleRepository.find).toHaveBeenCalled();
      expect(roleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getRoleByName', () => {
    it('should return a role by name', async () => {
      const role = {
        id: '1',
        name: RoleEnum.ADMIN,
        permissions: ['READ', 'WRITE'],
      };
      mockRoleRepository.findOne.mockResolvedValueOnce(role);

      const result = await service.getRoleByName(RoleEnum.ADMIN);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { name: RoleEnum.ADMIN },
      });
      expect(result).toEqual(role);
    });

    it('should return null if no role is found', async () => {
      mockRoleRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.getRoleByName(RoleEnum.ADMIN);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { name: RoleEnum.ADMIN },
      });
      expect(result).toBeNull();
    });
  });
});
