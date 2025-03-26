import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { IngestionProvider } from './ingestion.provider';

@Module({
  controllers: [IngestionController],
  providers: [IngestionService, ...IngestionProvider],
})
export class IngestionModule {}
