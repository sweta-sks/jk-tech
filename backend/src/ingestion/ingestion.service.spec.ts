import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { ClientProxy } from '@nestjs/microservices';
import { HttpException } from '@nestjs/common';
import { INGESTION_PROVIDER } from './constant';
import { of, throwError } from 'rxjs';
import { CreateIngestionDto } from './dto/create-ingestion.dto';
import { mockUserEntity } from '../user/mock/user-entity.fixture';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { PermissionEnum } from '../role/enums/permissions.enum';

describe('IngestionService', () => {
  let service: IngestionService;
  let ingestionClient: ClientProxy;

  const mockIngestionClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: INGESTION_PROVIDER,
          useValue: mockIngestionClient,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    ingestionClient = module.get<ClientProxy>(INGESTION_PROVIDER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an ingestion', async () => {
      const createDto: CreateIngestionDto = {
        documentId: 'doc-123',
      };
      const user = { id: 'user-id', email: 'user@test.com' };
      const expectedResponse = {
        message: 'Ingestion started',
        ingestionId: '5ff0fdeb-f84e-4b7d-9f58-f0eb2f6c757f',
        status: 'processing',
      };

      mockIngestionClient.send.mockReturnValue(of(expectedResponse));
      const { password, role, ...rest } = mockUserEntity;
      const currentUser: AuthenticatedUser = {
        ...rest,
        role: role.name,
        permissions: [PermissionEnum.MANAGE],
      };
      const result = await service.create(createDto, currentUser);

      expect(result).toMatchObject(expectedResponse);
      expect(mockIngestionClient.send).toHaveBeenCalledWith(
        'create_ingestion',
        {
          ...createDto,
          userId: currentUser.id,
        },
      );
    });

    it('should throw HttpException when microservice call fails', async () => {
      const createDto: CreateIngestionDto = {
        documentId: 'doc-123',
      };

      const error = new Error('Microservice error');

      mockIngestionClient.send.mockReturnValue(throwError(() => error));
      const { password, role, ...rest } = mockUserEntity;
      const currentUser: AuthenticatedUser = {
        ...rest,
        role: role.name,
        permissions: [PermissionEnum.MANAGE],
      };
      await expect(service.create(createDto, currentUser)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an ingestion by id', async () => {
      const ingestionId = 'test-id';
      const expectedResponse = {
        id: ingestionId,
        name: 'Test Ingestion',
        documentId: 'doc-123',
        data: {},
      };

      mockIngestionClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.findOne(ingestionId);

      expect(result).toEqual(expectedResponse);
      expect(mockIngestionClient.send).toHaveBeenCalledWith(
        'get_ingestion',
        ingestionId,
      );
    });

    it('should throw HttpException when ingestion not found', async () => {
      const ingestionId = 'non-existent-id';
      const error = new Error('Not found');

      mockIngestionClient.send.mockReturnValue(throwError(() => error));

      await expect(service.findOne(ingestionId)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return all ingestions', async () => {
      const expectedResponse = [
        {
          id: '1',
          name: 'First',
          documentId: 'doc-1',
          data: {},
        },
        {
          id: '2',
          name: 'Second',
          documentId: 'doc-2',
          data: {},
        },
      ];

      mockIngestionClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.findAll();

      expect(result).toEqual(expectedResponse);
      expect(mockIngestionClient.send).toHaveBeenCalledWith(
        'get_all_ingestion',
        {},
      );
    });

    it('should throw HttpException when microservice call fails', async () => {
      const error = new Error('Microservice error');

      mockIngestionClient.send.mockReturnValue(throwError(() => error));

      await expect(service.findAll()).rejects.toThrow(HttpException);
    });
  });
});
