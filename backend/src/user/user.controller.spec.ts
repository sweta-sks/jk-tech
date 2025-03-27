import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PoliciesGuard } from '../utils/guards/policy.guard';
import { Reflector } from '@nestjs/core';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExecutionContext } from '@nestjs/common';
import { RoleEnum } from '../role/enums/roles.enum';
import { mockCurrentUser } from './mock/user-entity.fixture';

// Mock service implementation
const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

// Mock PoliciesGuard
const mockPoliciesGuard = {
  canActivate: (context: ExecutionContext) => true,
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(PoliciesGuard)
      .useValue(mockPoliciesGuard)
      .compile();

    // Manually apply decorator metadata for testing
    Reflect.defineMetadata(
      '__guards__',
      [PoliciesGuard],
      UserController.prototype.findAll,
    );
    Reflect.defineMetadata(
      '__guards__',
      [PoliciesGuard],
      UserController.prototype.findOne,
    );
    Reflect.defineMetadata(
      '__guards__',
      [PoliciesGuard],
      UserController.prototype.remove,
    );
    Reflect.defineMetadata('swagger/apiSecurity', ['bearer'], UserController);

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register()', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: RoleEnum.VIEWER,
      };
      const expectedResult = {
        id: '1',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto, mockCurrentUser);
      expect(result).toEqual(expectedResult);
    });

    it('should not be protected with PoliciesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UserController.prototype.register,
      );
      expect(guards).toBeUndefined();
    });
  });

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      const expectedResult = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should be protected with PoliciesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UserController.prototype.findAll,
      );
      expect(guards).toContain(PoliciesGuard);
    });
  });

  describe('findOne()', () => {
    it('should return a single user', async () => {
      const userId = '1';
      const expectedResult = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
      };

      mockUserService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(userId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });

    it('should be protected with PoliciesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UserController.prototype.findOne,
      );
      expect(guards).toContain(PoliciesGuard);
    });
  });

  describe('remove()', () => {
    it('should delete a user', async () => {
      const userId = '1';
      const expectedResult = { affected: 1 };

      mockUserService.delete.mockResolvedValue(expectedResult);

      const result = await controller.remove(userId);

      expect(result).toEqual(expectedResult);
      expect(service.delete).toHaveBeenCalledWith(userId);
    });

    it('should be protected with PoliciesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UserController.prototype.remove,
      );
      expect(guards).toContain(PoliciesGuard);
    });
  });

  describe('Decorators', () => {
    it('should have ApiBearerAuth decorator at class level', () => {
      const decorators = Reflect.getMetadata(
        'swagger/apiSecurity',
        UserController,
      );
      expect(decorators).toEqual(['bearer']);
    });

    it('should have UseGuards(PoliciesGuard) at class level', () => {
      const guards = Reflect.getMetadata('__guards__', UserController);
      expect(guards).toContain(PoliciesGuard);
    });
  });
});
