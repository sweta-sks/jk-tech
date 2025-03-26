import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @MinLength(6)
  @IsNotEmpty()
  password?: string;
}
