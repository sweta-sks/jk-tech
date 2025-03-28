import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DOCUMENT_PROVIDER } from './constant';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { rm, stat } from 'fs/promises';
import { v4 as uuidV4 } from 'uuid';
import { convertBytes } from '../utils/convert-file';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  constructor(
    @Inject(DOCUMENT_PROVIDER)
    private readonly documentRepository: Repository<Document>,
    private readonly configService: ConfigService,
  ) {}

  // async onModuleInit() {
  //   await this.documentRepository.delete({});
  // }
  async getSizeOfDocument(path: string) {
    const stats = await stat(path);
    const size = stats.size;

    return convertBytes(size);
  }

  async create(file: Express.Multer.File, body: CreateDocumentDto) {
    try {
      const hostUrl = this.configService.get('host.url');

      const extension = file.originalname.split('.').pop();
      const fileId = uuidV4();
      if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
      }
      const filePath = `uploads/${fileId}.${extension}`;

      fs.writeFileSync(`./${filePath}`, file.buffer);
      const size = await this.getSizeOfDocument(filePath);

      const fileData = await this.documentRepository.create({
        id: fileId,
        name: file.originalname,
        mimeType: file.mimetype,
        size: size,
        extension,
      });

      return await this.documentRepository.save(fileData);
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(err.message, err.status || 500);
    }
  }

  async findAll() {
    try {
      return await this.documentRepository.find();
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.documentRepository.findOne({
        where: { id },
      });
      if (!data) {
        throw new HttpException('Document not found', 404);
      }
      return data;
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async update(id: string, file: Express.Multer.File) {
    try {
      const document = await this.documentRepository.findOne({
        where: { id },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      const extension = file.originalname.split('.').pop();
      const filePath = `uploads/${document.id}.${extension}`;
      fs.writeFileSync(`./${filePath}`, file.buffer);
      const size = await this.getSizeOfDocument(filePath);

      document.name = file.originalname;
      document.mimeType = file.mimetype;
      document.size = size;
      document.extension = extension;

      return await this.documentRepository.save(document);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async remove(id: string) {
    {
      try {
        const document = await this.documentRepository.findOne({
          where: { id },
        });
        if (!document) {
          throw new HttpException('Document not found', 404);
        }
        const filePath = `uploads/${document.id}.${document.extension}`;
        await rm(filePath, { force: true });
        return await this.documentRepository.delete(id);
      } catch (error) {
        this.logger.error(error.message);
        throw new HttpException(error.message, error.status || 500);
      }
    }
  }
}
