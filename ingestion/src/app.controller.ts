import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('create_ingestion')
  createIngestion(data: any) {
    return this.appService.createIngestion(data);
  }

  @MessagePattern('get_ingestion')
  getIngestion(ingestionId: string) {
    return this.appService.getIngestion(ingestionId);
  }

  @MessagePattern('get_all_ingestion')
  getAllIngestion() {
    return this.appService.getAllIngestion();
  }
}
