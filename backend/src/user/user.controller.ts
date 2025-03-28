import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../utils/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { PoliciesGuard } from '../utils/guards/policy.guard';

@Controller('user')
@ApiBearerAuth()
@UseGuards(PoliciesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body() createUser: CreateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return await this.userService.create(createUser, currentUser);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.userService.update(id, updateUserDto, user);
  }
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.userService.delete(id, user);
  }
}
