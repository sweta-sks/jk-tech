import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateIngestionDto } from './dto/create-ingestion.dto';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';
import { INGESTION_PROVIDER } from './constant';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';

@Injectable()
export class IngestionService {
  constructor(
    @Inject(INGESTION_PROVIDER)
    private readonly signServiceClient: ClientProxy,
  ) {}
  async create(
    createIngestionDto: CreateIngestionDto,
    user: AuthenticatedUser,
  ) {
    try {
      const response = await firstValueFrom(
        this.signServiceClient.send('create_ingestion', {
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
        this.signServiceClient.send('get_ingestion', id),
      );
      console.log(response);
      return response;
    } catch (err) {
      throw new HttpException(err.message, err.status || 500);
    }
  }
}
