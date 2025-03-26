import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateIngestionDto } from './dto/create-ingestion.dto';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';
import { INGESTION_PROVIDER } from './constant';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  constructor(
    @Inject(INGESTION_PROVIDER)
    private readonly ingestionClient: ClientProxy,
  ) {}
  async create(
    createIngestionDto: CreateIngestionDto,
    user: AuthenticatedUser,
  ) {
    try {
      this.logger.debug('Creating Ingestion');
      const response = await firstValueFrom(
        this.ingestionClient.send('create_ingestion', {
          ...createIngestionDto,
          userId: user.id,
        }),
      );
      console.log(response);
      return response;
    } catch (err) {
      throw new HttpException(err.message, err.status || 500);
    }
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
        this.ingestionClient.send('get_ingestion', id),
      );
      console.log(response);
      return response;
    } catch (err) {
      throw new HttpException(err.message, err.status || 500);
    }
  }

  async findAll() {
    try {
      const response = await firstValueFrom(
        this.ingestionClient.send('get_all_ingestion', {}),
      );
      console.log(response);
      return response;
    } catch (err) {
      throw new HttpException(err.message, err.status || 500);
    }
  }
}
