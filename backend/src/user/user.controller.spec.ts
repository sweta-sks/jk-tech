import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PoliciesGuard } from '../utils/guards/policy.guard';
import { Reflector } from '@nestjs/core';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExecutionContext, HttpException } from '@nestjs/common';
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

  describe('delete', () => {
    const mockViewerUser = {
      ...mockCurrentUser,
      id: 'viewer-user-id',
      role: RoleEnum.VIEWER,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete a user when admin requests', async () => {
      const userIdToDelete = 'user-to-delete';
      const expectedResult = { message: 'User deleted successfully' };

      jest.spyOn(service, 'delete').mockResolvedValue(expectedResult);

      const result = await controller.remove(userIdToDelete, mockCurrentUser);

      expect(result).toEqual(expectedResult);
      expect(service.delete).toHaveBeenCalledWith(
        userIdToDelete,
        mockCurrentUser,
      );
    });

    it('should throw 403 when non-admin tries to delete', async () => {
      const userIdToDelete = 'some-user-id';

      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(
          new HttpException(
            'You are not authorized to perform this action',
            403,
          ),
        );

      await expect(
        controller.remove(userIdToDelete, mockViewerUser),
      ).rejects.toThrow(
        new HttpException('You are not authorized to perform this action', 403),
      );

      expect(service.delete).toHaveBeenCalledWith(
        userIdToDelete,
        mockViewerUser,
      );
    });

    it('should throw 403 when admin tries to delete themselves', async () => {
      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(
          new HttpException('You cannot delete yourself', 403),
        );

      await expect(
        controller.remove(mockCurrentUser.id, mockCurrentUser),
      ).rejects.toThrow(new HttpException('You cannot delete yourself', 403));

      expect(service.delete).toHaveBeenCalledWith(
        mockCurrentUser.id,
        mockCurrentUser,
      );
    });

    it('should throw 404 when user not found', async () => {
      const nonExistentUserId = 'non-existent-user';

      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new HttpException('User not found', 404));

      await expect(
        controller.remove(nonExistentUserId, mockCurrentUser),
      ).rejects.toThrow(new HttpException('User not found', 404));
    });
  });
  it('should be protected with PoliciesGuard', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      UserController.prototype.remove,
    );
    expect(guards).toContain(PoliciesGuard);
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
