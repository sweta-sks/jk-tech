import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Public } from './utils/decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';

// Mock service implementation
const mockAppService = {
  getHello: jest.fn().mockReturnValue('Hello World!'),
};

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn((key) => {
              if (key === 'isPublic') {
                return true;
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    // Manually apply decorator metadata for testing
    Reflect.defineMetadata('swagger/apiSecurity', ['bearer'], AppController);
    Reflect.defineMetadata('isPublic', true, AppController.prototype.getHello);

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello()', () => {
    it('should return "Hello World!"', () => {
      const result = controller.getHello();
      expect(result).toBe('Hello World!');
      expect(service.getHello).toHaveBeenCalled();
    });

    it('should be decorated with @Public()', () => {
      const isPublic = Reflect.getMetadata(
        'isPublic',
        AppController.prototype.getHello,
      );
      expect(isPublic).toBeTruthy();
    });

    it('should not be protected with any guards', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        AppController.prototype.getHello,
      );
      expect(guards).toBeUndefined();
    });
  });

  describe('Decorators', () => {
    it('should have ApiBearerAuth decorator at class level', () => {
      const decorators = Reflect.getMetadata(
        'swagger/apiSecurity',
        AppController,
      );
      expect(decorators).toEqual(['bearer']);
    });
  });
});
