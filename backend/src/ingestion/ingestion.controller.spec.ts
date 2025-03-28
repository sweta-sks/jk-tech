import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { CreateIngestionDto } from './dto/create-ingestion.dto';
import { PoliciesGuard } from '../utils/guards/policy.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { mockCurrentUser } from '../user/mock/user-entity.fixture';
import { ApiBearerAuth } from '@nestjs/swagger';

// Mock service
const mockIngestionService = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
};

// Mock PoliciesGuard
const mockPoliciesGuard = {
  canActivate: (context: ExecutionContext) => true,
};

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn((key) => {
              if (key === 'policy') return true;
              return undefined;
            }),
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
      IngestionController.prototype.create,
    );
    Reflect.defineMetadata(
      '__guards__',
      [PoliciesGuard],
      IngestionController.prototype.findOne,
    );
    Reflect.defineMetadata(
      '__guards__',
      [PoliciesGuard],
      IngestionController.prototype.findAll,
    );
    Reflect.defineMetadata(
      'swagger/apiSecurity',
      ['bearer'],
      IngestionController.prototype.create,
    );

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should call service.create with correct parameters', async () => {
      const createDto: CreateIngestionDto = {
        documentId: 'doc-123',
      };
      const expectedResult = { id: 'ingestion-id', ...createDto };

      mockIngestionService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, mockCurrentUser);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto, mockCurrentUser);
    });

    it('should be protected with PoliciesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        IngestionController.prototype.create,
      );
      expect(guards).toContain(PoliciesGuard);
    });

    it('should have ApiBearerAuth decorator', () => {
      const decorators = Reflect.getMetadata(
        'swagger/apiSecurity',
        IngestionController.prototype.create,
      );
      expect(decorators).toEqual(['bearer']);
    });
  });

  describe('findOne()', () => {
    it('should call service.findOne with correct id', async () => {
      const id = 'test-id';
      const expectedResult = { id, name: 'Test Ingestion' };

      mockIngestionService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should be protected with PoliciesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        IngestionController.prototype.findOne,
      );
      expect(guards).toContain(PoliciesGuard);
    });
  });

  describe('findAll()', () => {
    it('should call service.findAll', async () => {
      const expectedResult = [
        { id: '1', name: 'First' },
        { id: '2', name: 'Second' },
      ];

      mockIngestionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should be protected with PoliciesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        IngestionController.prototype.findAll,
      );
      expect(guards).toContain(PoliciesGuard);
    });
  });
});
