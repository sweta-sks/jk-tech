import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @MinLength(3)
  password: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
