import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentProvider } from './document.provider';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, DocumentProvider],
})
export class DocumentModule {}
