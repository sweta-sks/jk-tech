import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { CreateIngestionDto } from './dto/create-ingestion.dto';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PoliciesGuard } from '../utils/guards/policy.guard';
import { CurrentUser } from '../utils/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

@Controller('ingestion')
@ApiBearerAuth()
@UseGuards(PoliciesGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  create(
    @Body() createIngestionDto: CreateIngestionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ingestionService.create(createIngestionDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingestionService.findOne(id);
  }

  @Get()
  findAll() {
    return this.ingestionService.findAll();
  }
}
