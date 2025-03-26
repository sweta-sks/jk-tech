import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { INGESTION_PROVIDER } from './constant';
import { Repository } from 'typeorm';
import { Ingestion } from './entity/ingestion.entity';
import { StatusEnum } from './enum/status.enum';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @Inject(INGESTION_PROVIDER)
    private readonly ingestionRepository: Repository<Ingestion>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async createIngestion(data: any) {
    try {
      const ingestion = new Ingestion();
      ingestion.documentId = data.documentId;
      ingestion.status = StatusEnum.PROCESSING;
      ingestion.userId = data.userId;
      await this.ingestionRepository.save(ingestion);
      this.logger.log(`Ingestion started for document: ${data.documentId}`);
      console.log(`Ingestion started for document: ${data}`);
      setTimeout(async () => {
        const isSuccess = Math.random() > 0.2;

        ingestion.status = isSuccess ? StatusEnum.COMPLETED : StatusEnum.FAILED;

        await this.ingestionRepository.save(ingestion);
        this.logger.log(
          `Ingestion ${isSuccess ? 'completed' : 'failed'} for document: ${data.documentId}`,
        );
      }, 5000);

      return {
        message: 'Ingestion started',
        ingestionId: ingestion.id,
        status: ingestion.status,
      };
    } catch (err) {
      this.logger.error(`Error in ingestion: ${err.message}`);
      throw new HttpException(err.message, err.status || 500);
    }
  }

  getIngestion(ingestionId: string) {
    return this.ingestionRepository.findOne({ where: { id: ingestionId } });
  }
  async getAllIngestion() {
    return this.ingestionRepository.find();
  }
}
