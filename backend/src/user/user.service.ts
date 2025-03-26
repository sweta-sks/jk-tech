import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_PROVIDER } from './constant';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { console } from 'inspector';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @Inject(USER_PROVIDER)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async comparePassword(
    password: string,
    receivedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, receivedPassword);
  }

  async encryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.configService.get('bcrypt.salt'));
    return await bcrypt.hash(password, salt);
  }
  async onModuleInit() {
    try {
      const adminUser = await this.configService.get('admin');
      // const password = await this.encryptPassword(adminUser.password);

      const existSuperAdmin = await this.userRepository.findOne({
        where: {
          email: adminUser.email,
        },
      });

      if (!existSuperAdmin) {
        const user = this.userRepository.create({
          name: adminUser.name,
          email: adminUser.email,
          password: adminUser.password,
        });

        await this.userRepository.save(user);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

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

  async checkPassword() {
    const adminPass =
      '$2b$10$YHBNVu6Qgkk0JriIzumaxuC4uMfCPg/SmyHsXZSgtPey0r1MiyW9C';
    const mainPass = 'admin@123';
    const checkPassword = await this.comparePassword(mainPass, adminPass);
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
