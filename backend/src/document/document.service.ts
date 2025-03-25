import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DOCUMENT_PROVIDER } from './constant';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { rm, stat } from 'fs/promises';
import { v4 as uuidV4 } from 'uuid';
import { convertBytes } from 'src/utils/convert-file';

@Injectable()
export class DocumentService {
  constructor(
    @Inject(DOCUMENT_PROVIDER)
    private readonly documentRepository: Repository<Document>,
    private readonly configService: ConfigService,
  ) {}

  async getSizeOfDocument(path: string) {
    const stats = await stat(path);
    const size = stats.size;

    return convertBytes(size);
  }

  async create(file: Express.Multer.File, body: CreateDocumentDto) {
    try {
      const hostUrl = this.configService.get('host.url');
      console.log({ hostUrl });
      const extension = file.originalname.split('.').pop();
      const fileId = uuidV4();
      if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
      }
      const filePath = `uploads/${fileId}.${extension}`;
      console.log(filePath);

      fs.writeFileSync(`./${filePath}`, file.buffer);
      const size = await this.getSizeOfDocument(filePath);
      console.log({ size });
      const fileData = await this.documentRepository.create({
        id: fileId,
        name: file.originalname,
        mimeType: file.mimetype,
        size: parseFloat(size),
        extension,
      });

      return await this.documentRepository.save(fileData);
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, err.status || 500);
    }
  }

  async findAll() {
    return await this.documentRepository.find();
  }

  async findOne(id: string) {
    return await this.documentRepository.findOne({
      where: { id },
    });
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
      document.size = parseFloat(size);
      document.extension = extension;

      return await this.documentRepository.save(document);
    } catch (e) {
      throw new HttpException(e.message, e.status || 500);
    }
  }
}
