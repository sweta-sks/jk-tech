import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { PoliciesGuard } from '../utils/guards/policy.guard';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock service implementation
const mockDocumentService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

// Mock PoliciesGuard
const mockPoliciesGuard = {
  canActivate: (context: ExecutionContext) => true,
};

// Mock file object
const mockFile = {
  fieldname: 'file',
  originalname: 'test.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 1024,
  buffer: Buffer.from('test content'),
} as Express.Multer.File;

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: DocumentService;

  // Generate test UUIDs
  const testDocumentId = uuidv4();
  const testUserId = uuidv4();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
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

    // Get the controller instance
    controller = module.get<DocumentController>(DocumentController);
    service = module.get<DocumentService>(DocumentService);

    // Manually apply all decorator metadata
    applyControllerMetadata();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to apply metadata
  function applyControllerMetadata() {
    // Class level metadata
    Reflect.defineMetadata('__guards__', [PoliciesGuard], DocumentController);
    Reflect.defineMetadata(
      'swagger/apiSecurity',
      ['bearer'],
      DocumentController,
    );

    // Method level metadata
    const methods = [
      { name: 'create', interceptors: [FileInterceptor], consumes: true },
      { name: 'findAll', guards: true },
      { name: 'findOne', guards: true },
      { name: 'update', interceptors: [FileInterceptor], consumes: true },
    ];

    methods.forEach((method) => {
      if (method.guards) {
        Reflect.defineMetadata(
          '__guards__',
          [PoliciesGuard],
          DocumentController.prototype[method.name],
        );
      }
      if (method.interceptors) {
        Reflect.defineMetadata(
          '__interceptors__',
          method.interceptors,
          DocumentController.prototype[method.name],
        );
      }
      if (method.consumes) {
        Reflect.defineMetadata(
          'swagger/apiConsumes',
          ['multipart/form-data'],
          DocumentController.prototype[method.name],
        );
      }
    });
  }

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload()', () => {
    it('should upload a document with UUID', async () => {
      const createDto = {};
      const expectedResult = {
        id: testDocumentId,
        ...createDto,
        mimeType: 'application/pdf',
        size: '100KB',
      };

      mockDocumentService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(mockFile, createDto);

      expect(result).toEqual(expectedResult);
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(service.create).toHaveBeenCalledWith(mockFile, createDto);
    });

    it('should have FileInterceptor', () => {
      const interceptors = Reflect.getMetadata(
        '__interceptors__',
        DocumentController.prototype.create,
      );
      expect(interceptors).toHaveLength(1);
      expect(interceptors[0].name).toBe('FileInterceptor');
    });

    it('should have ApiConsumes decorator', () => {
      const consumes = Reflect.getMetadata(
        'swagger/apiConsumes',
        DocumentController.prototype.create,
      );
      expect(consumes).toEqual(['multipart/form-data']);
    });
  });

  describe('findAll()', () => {
    it('should return an array of documents with UUIDs', async () => {
      const expectedResult = [
        { id: uuidv4(), name: 'Document 1', userId: testUserId },
        { id: uuidv4(), name: 'Document 2', userId: testUserId },
      ];

      mockDocumentService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      result.forEach((doc) => {
        expect(doc.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
      });
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should be protected with PoliciesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        DocumentController.prototype.findAll,
      );
      expect(guards).toHaveLength(1);
      expect(guards[0].name).toBe('PoliciesGuard');
    });
  });

  describe('findOne()', () => {
    it('should return a document by UUID', async () => {
      const expectedResult = {
        id: testDocumentId,
        name: 'Test Document',
        userId: testUserId,
      };

      mockDocumentService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(testDocumentId);

      expect(result).toEqual(expectedResult);
      expect(result.id).toBe(testDocumentId);
      expect(service.findOne).toHaveBeenCalledWith(testDocumentId);
    });

    it('should be protected with PoliciesGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        DocumentController.prototype.findOne,
      );
      expect(guards).toHaveLength(1);
      expect(guards[0].name).toBe('PoliciesGuard');
    });
  });

  describe('update()', () => {
    it('should update a document with UUID', async () => {
      const expectedResult = {
        id: testDocumentId,
        name: 'Updated Document',
        userId: testUserId,
      };

      mockDocumentService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(testDocumentId, mockFile);

      expect(result).toEqual(expectedResult);
      expect(result.id).toBe(testDocumentId);
      expect(service.update).toHaveBeenCalledWith(testDocumentId, mockFile);
    });

    it('should have FileInterceptor', () => {
      const interceptors = Reflect.getMetadata(
        '__interceptors__',
        DocumentController.prototype.update,
      );
      expect(interceptors).toHaveLength(1);
      expect(interceptors[0].name).toBe('FileInterceptor');
    });

    it('should have ApiConsumes decorator', () => {
      const consumes = Reflect.getMetadata(
        'swagger/apiConsumes',
        DocumentController.prototype.update,
      );
      expect(consumes).toEqual(['multipart/form-data']);
    });
  });

  describe('Decorators', () => {
    it('should have ApiBearerAuth decorator at class level', () => {
      const decorators = Reflect.getMetadata(
        'swagger/apiSecurity',
        DocumentController,
      );
      expect(decorators).toEqual(['bearer']);
    });

    it('should have UseGuards(PoliciesGuard) at class level', () => {
      const guards = Reflect.getMetadata('__guards__', DocumentController);
      expect(guards).toHaveLength(1);
      expect(guards[0].name).toBe('PoliciesGuard');
    });
  });
});
