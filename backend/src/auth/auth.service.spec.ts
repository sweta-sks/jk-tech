import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { mockUserEntity } from 'src/user/mock/user-entity.fixture';

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
    it('should return an access token when user authentication is successful', async () => {
      jest
        .spyOn(userService, 'authenticateUser')
        .mockResolvedValue(mockUserEntity);

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = await authService.authenticateUser(loginDto);
      console.log(result);
      expect(result).toEqual({ accessToken: 'mockedAccessToken' });
      expect(userService.authenticateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUserEntity.id,
        email: mockUserEntity.email,
      });
    });

    it('should throw an HttpException when authentication fails', async () => {
      jest
        .spyOn(userService, 'authenticateUser')
        .mockRejectedValue(new HttpException('Invalid credentials', 401));

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

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
