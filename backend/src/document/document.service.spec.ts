import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import { convertBytes } from '../utils/convert-file';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('../utils/convert-file');

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepository: Repository<Document>;
  let configService: ConfigService;

  const mockDocumentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'host.url') return 'http://localhost:3000';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: 'DOCUMENT_PROVIDER',
          useValue: mockDocumentRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepository = module.get<Repository<Document>>('DOCUMENT_PROVIDER');
    configService = module.get<ConfigService>(ConfigService);

    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a document', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;

      const mockDocument = {
        id: uuidV4(),
        name: 'test.pdf',
        mimeType: 'application/pdf',
        size: '100KB',
        extension: 'pdf',
      };

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fsPromises.stat as jest.Mock).mockResolvedValue({ size: 102400 });
      (convertBytes as jest.Mock).mockReturnValue('100KB');
      mockDocumentRepository.create.mockReturnValue(mockDocument);
      mockDocumentRepository.save.mockResolvedValue(mockDocument);

      const result = await service.create(mockFile, {});

      expect(result).toEqual(mockDocument);
      expect(fs.existsSync).toHaveBeenCalledWith('uploads');
      expect(fs.mkdirSync).toHaveBeenCalledWith('uploads');
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockDocumentRepository.create).toHaveBeenCalled();
      expect(mockDocumentRepository.save).toHaveBeenCalledWith(mockDocument);
    });

    it('should throw HttpException when file creation fails', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File write error');
      });

      await expect(service.create(mockFile, {})).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const mockDocuments = [
        {
          id: uuidV4(),
          name: 'test1.pdf',
          mimeType: 'application/pdf',
          size: '100KB',
          extension: 'pdf',
        },
        {
          id: uuidV4(),
          name: 'test2.pdf',
          mimeType: 'application/pdf',
          size: '200KB',
          extension: 'pdf',
        },
      ];

      mockDocumentRepository.find.mockResolvedValue(mockDocuments);

      const result = await service.findAll();

      expect(result).toEqual(mockDocuments);
      expect(mockDocumentRepository.find).toHaveBeenCalled();
    });

    it('should throw HttpException when find fails', async () => {
      mockDocumentRepository.find.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a single document', async () => {
      const mockDocument = {
        id: uuidV4(),
        name: 'test.pdf',
        mimeType: 'application/pdf',
        size: '100KB',
        extension: 'pdf',
      };

      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findOne(mockDocument.id);

      expect(result).toEqual(mockDocument);
      expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
      });
    });

    it('should throw HttpException when document not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(uuidV4())).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should successfully update a document', async () => {
      const existingDocument = {
        id: uuidV4(),
        name: 'old.pdf',
        mimeType: 'application/pdf',
        size: '100KB',
        extension: 'pdf',
      };

      const updatedFile = {
        originalname: 'new.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('new content'),
      } as Express.Multer.File;

      mockDocumentRepository.findOne.mockResolvedValue(existingDocument);
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fsPromises.stat as jest.Mock).mockResolvedValue({ size: 204800 });
      (convertBytes as jest.Mock).mockReturnValue('200KB');
      mockDocumentRepository.save.mockResolvedValue({
        ...existingDocument,
        name: 'new.pdf',
        size: '200KB',
      });

      const result = await service.update(existingDocument.id, updatedFile);

      expect(result.name).toBe('new.pdf');
      expect(result.size).toBe('200KB');
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockDocumentRepository.save).toHaveBeenCalled();
    });

    it('should throw HttpException when document to update not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      const mockFile = {
        originalname: 'new.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('new content'),
      } as Express.Multer.File;

      await expect(service.update(uuidV4(), mockFile)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw HttpException when file update fails', async () => {
      const existingDocument = {
        id: uuidV4(),
        name: 'old.pdf',
        mimeType: 'application/pdf',
        size: '100KB',
        extension: 'pdf',
      };

      mockDocumentRepository.findOne.mockResolvedValue(existingDocument);
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File write error');
      });

      const mockFile = {
        originalname: 'new.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('new content'),
      } as Express.Multer.File;

      await expect(
        service.update(existingDocument.id, mockFile),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getSizeOfDocument', () => {
    it('should throw HttpException when file stat fails', async () => {
      (fsPromises.stat as jest.Mock).mockRejectedValue(
        new Error('File not found'),
      );

      await expect(
        service.getSizeOfDocument('nonexistent.pdf'),
      ).rejects.toThrow(new HttpException('File not found', 500));
    });
  });
});
