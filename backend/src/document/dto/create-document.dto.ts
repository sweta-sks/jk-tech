import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file?: any;
}
