import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';
import { RoleEnum } from '../../role/enums/roles.enum';
import { ApiProperty } from '@nestjs/swagger';

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

  @IsEnum(RoleEnum, {
    message: `roleName must be a valid enum value (${Object.values(RoleEnum)})`,
  })
  @IsNotEmpty()
  @ApiProperty({
    description: 'The role of the user',
    example: RoleEnum.VIEWER,
  })
  role: RoleEnum;
}
