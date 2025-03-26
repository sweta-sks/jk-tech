import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_PROVIDER } from './constant';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @Inject(USER_PROVIDER)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {}
  async create(createUserDto: CreateUserDto) {
    try {
      const existUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });
      if (existUser) {
        throw new HttpException('Email already exists', 400);
      }
      const user = this.userRepository.create(createUserDto);
      return this.userRepository.save(user);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }
}
