import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { Public } from '../utils/decorators/public.decorator';
import { JwtAuthGuard } from '../utils/guards/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { mockCurrentUser } from '../user/mock/user-entity.fixture';

// Mock AuthService
const mockAuthService = {
  authenticateUser: jest.fn(),
};

// Mock JWT Guard
const mockJwtAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'user-id', email: 'test@example.com' }; // Mock user
    return true;
  },
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn((key) => {
              if (key === 'isPublic') {
                return true; // For testing public routes
              }
              return false;
            }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.authenticateUser with loginDto', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { accessToken: 'mock-token' };

      mockAuthService.authenticateUser.mockResolvedValue(expectedResult);

      const result = await controller.create(loginDto);

      expect(result).toEqual(expectedResult);
      expect(authService.authenticateUser).toHaveBeenCalledWith(loginDto);
    });

    it('should be decorated with @Public()', () => {
      const metadata = Reflect.getMetadata(
        'isPublic',
        AuthController.prototype.create,
      );
      expect(metadata).toBeTruthy();
    });
  });

  describe('logout', () => {
    it('should return current user', async () => {
      const logoutDto: LogoutDto = { token: 'mock-token' };
      const mockRequest = {
        headers: {
          authorization: 'Bearer mock-token',
        },
        user: mockCurrentUser,
      };

      const result = await controller.remove(
        logoutDto,
        mockRequest,
        mockRequest.user,
      );

      expect(result).toEqual(mockRequest.user);
    });
  });
});
