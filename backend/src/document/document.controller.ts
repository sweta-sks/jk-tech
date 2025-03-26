import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  async create(
    @UploadedFile() file: Express.Multer.File,

    @Body() body: CreateDocumentDto,
  ) {
    return await this.documentService.create(file, body);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.documentService.update(id, file);
  }
}
