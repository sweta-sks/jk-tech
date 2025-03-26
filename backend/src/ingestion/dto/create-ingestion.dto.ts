import { IsDefined, IsNumber, IsString } from 'class-validator';

export class CreateIngestionDto {
  @IsString()
  @IsDefined()
  documentId: string;
}
