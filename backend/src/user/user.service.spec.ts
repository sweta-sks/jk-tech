import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { RoleService } from '../role/role.service';
import { ConfigService } from '@nestjs/config';
import { RoleEnum } from '../role/enums/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { USER_PROVIDER } from './constant';
import { mockCurrentUser } from './mock/user-entity.fixture';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let roleService: RoleService;
  let configService: ConfigService;

  const mockUserRepository = {
    createQueryBuilder: jest.fn(() => ({
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };

  const mockRoleService = {
    getRoleByName: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'bcrypt.salt') return 10;
      if (key === 'admin')
        return {
          email: 'admin@example.com',
          name: 'Admin',
          password: 'admin123',
        };
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_PROVIDER, // Use the actual token from your constant
          useValue: mockUserRepository,
        },
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(USER_PROVIDER);
    roleService = module.get<RoleService>(RoleService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create admin user if not exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockRoleService.getRoleByName.mockResolvedValue({
        id: 'role-id',
        name: RoleEnum.ADMIN,
      });
      mockUserRepository.create.mockReturnValue({});
      mockUserRepository.save.mockResolvedValue({});

      await service.onModuleInit();

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should not create admin user if already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-id' });

      await service.onModuleInit();

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should log error when initialization fails', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('DB Error'));
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      await service.onModuleInit();

      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        role: {
          id: 'e2676c70-faef-4c61-b285-bdd75abcbd71',
        },
        name: 'string',
        email: 'test@example.com',
        password:
          '$2b$10$gTJUva2MCgDuBYOksxgUauccYioHyoZL.rVUeOCCukNIdYri8jJQ2',
        id: '85b77acd-0d64-4088-9746-08be580b289f',
        createdAt: '2025-03-27T11:09:49.859Z',
        updatedAt: '2025-03-27T11:09:49.859Z',
      };

      // Mock the query builder chain
      const queryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      mockUserRepository.createQueryBuilder.mockImplementation(
        () => queryBuilder,
      );

      jest.spyOn(service, 'comparePassword').mockResolvedValue(true);

      const result = await service.authenticateUser(
        'test@example.com',
        'password',
      );

      // Create expected result without password
      const { password: _, ...expectedUser } = mockUser;

      expect(result).toEqual(expectedUser);
    });

    it('should throw error for invalid email', async () => {
      mockUserRepository.createQueryBuilder().getOne.mockResolvedValue(null);

      await expect(
        service.authenticateUser('wrong@example.com', 'password'),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      mockUserRepository
        .createQueryBuilder()
        .getOne.mockResolvedValue(mockUser);
      jest.spyOn(service, 'comparePassword').mockResolvedValue(false);

      await expect(
        service.authenticateUser('test@example.com', 'wrongPassword'),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when user has no password', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: null,
      };
      mockUserRepository
        .createQueryBuilder()
        .getOne.mockResolvedValue(mockUser);

      await expect(
        service.authenticateUser('test@example.com', 'password'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('jwtValidate', () => {
    it('should validate jwt and return user with role', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: {
          id: 'role-id',
          name: RoleEnum.VIEWER,
          permissions: ['read'],
        },
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.jwtValidate({ id: 'user-id' } as any);

      expect(result).toEqual({
        ...mockUser,
        role: mockUser.role.name,
        permissions: mockUser.role.permissions,
      });
    });

    it('should return null for invalid user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.jwtValidate({ id: 'invalid-id' } as any);

      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.jwtValidate({ id: 'user-id' } as any),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: RoleEnum.VIEWER,
    };

    it('should create a new user with hashed password', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockRoleService.getRoleByName.mockResolvedValue({ id: 'role-id' });
      jest
        .spyOn(service, 'encryptPassword')
        .mockResolvedValue('hashedPassword');
      mockUserRepository.save.mockResolvedValue({
        ...createUserDto,
        password: 'hashedPassword',
        role: { id: 'role-id' },
      });

      const result = await service.create(createUserDto, mockCurrentUser);

      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error for existing email', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.create(createUserDto, mockCurrentUser),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when role not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockRoleService.getRoleByName.mockResolvedValue(null);

      await expect(
        service.create(createUserDto, mockCurrentUser),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when password encryption fails', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockRoleService.getRoleByName.mockResolvedValue({ id: 'role-id' });
      jest
        .spyOn(service, 'encryptPassword')
        .mockRejectedValue(new Error('Encryption failed'));

      await expect(
        service.create(createUserDto, mockCurrentUser),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const plainPassword = 'password';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const result = await service.comparePassword(
        plainPassword,
        hashedPassword,
      );
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const result = await service.comparePassword('password', 'wronghash');
      expect(result).toBe(false);
    });
  });

  describe('encryptPassword', () => {
    it('should encrypt password using bcrypt', async () => {
      const password = 'password';
      const result = await service.encryptPassword(password);
      expect(result).not.toBe(password);
      expect(typeof result).toBe('string');
    });

    it('should use salt rounds from config', async () => {
      const saltSpy = jest.spyOn(bcrypt, 'genSalt');
      await service.encryptPassword('password');
      expect(saltSpy).toHaveBeenCalledWith(10);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const mockUsers = [{ id: '1' }, { id: '2' }];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
    });

    it('should throw error when database operation fails', async () => {
      const error = new HttpException('DB Error', 500);
      mockUserRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 'user-id' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-id');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent-id');
      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      const error = new HttpException('DB Error', 500);
      mockUserRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne('user-id')).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    const mockViewerUser = {
      ...mockCurrentUser,
      id: 'viewer-id',
      role: RoleEnum.VIEWER,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete user and return delete result when admin requests', async () => {
      const userIdToDelete = 'user-to-delete';
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(userIdToDelete, mockCurrentUser);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockUserRepository.delete).toHaveBeenCalledWith({
        id: userIdToDelete,
      });
    });

    it('should throw 403 when non-admin tries to delete', async () => {
      await expect(
        service.delete('some-user-id', mockViewerUser),
      ).rejects.toThrow(
        new HttpException('You are not authorized to perform this action', 403),
      );

      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw 403 when admin tries to delete themselves', async () => {
      await expect(
        service.delete(mockCurrentUser.id, mockCurrentUser),
      ).rejects.toThrow(new HttpException('You cannot delete yourself', 403));

      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw 404 when user not found', async () => {
      const nonExistentUserId = 'non-existent-user';
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(
        service.delete(nonExistentUserId, mockCurrentUser),
      ).rejects.toThrow(new HttpException('User not found', 404));

      expect(mockUserRepository.delete).toHaveBeenCalledWith({
        id: nonExistentUserId,
      });
    });

    it('should throw error when database operation fails', async () => {
      mockUserRepository.delete.mockRejectedValue(new Error('DB Error'));

      await expect(service.delete('user-id', mockCurrentUser)).rejects.toThrow(
        new HttpException('DB Error', 500),
      );

      expect(mockUserRepository.delete).toHaveBeenCalledWith({ id: 'user-id' });
    });
  });
});
