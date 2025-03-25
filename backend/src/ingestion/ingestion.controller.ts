import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { CreateIngestionDto } from './dto/create-ingestion.dto';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  create(@Body() createIngestionDto: CreateIngestionDto) {
    return this.ingestionService.create(createIngestionDto);
  }

  @Get()
  findAll() {
    return this.ingestionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingestionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngestionDto: UpdateIngestionDto) {
    return this.ingestionService.update(+id, updateIngestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingestionService.remove(+id);
  }
}
