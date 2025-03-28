import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { Exclude } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Exclude()
  id: string;
}
