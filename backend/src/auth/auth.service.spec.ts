import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { mockUserEntity } from '../user/mock/user-entity.fixture';
import { UserService } from '../user/user.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            authenticateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedAccessToken'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('authenticateUser', () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'string',
    };

    it('should return an access token when authentication is successful', async () => {
      jest
        .spyOn(userService, 'authenticateUser')
        .mockResolvedValue(mockUserEntity);

      const result = await authService.authenticateUser(loginDto);

      expect(result).toEqual({ accessToken: 'mockedAccessToken' });
      expect(userService.authenticateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw an HttpException when authentication fails', async () => {
      jest
        .spyOn(userService, 'authenticateUser')
        .mockRejectedValue(new HttpException('Invalid credentials', 401));

      await expect(authService.authenticateUser(loginDto)).rejects.toThrow(
        HttpException,
      );
      await expect(authService.authenticateUser(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(userService.authenticateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });
});
