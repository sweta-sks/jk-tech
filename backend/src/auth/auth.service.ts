import { HttpException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { jwtPayload } from './strategies/jwt.strategy';
import { JwtSignOptions, JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async authenticateUser(loginDto: LoginDto) {
    try {
      console.log('loginDto', loginDto);
      const user = await this.userService.authenticateUser(
        loginDto.email,
        loginDto.password,
      );

      const tokenData = {
        id: user.id,

        email: user.email,
      };
      const accessToken = await this.sign(tokenData);
      return { accessToken };
    } catch (error) {
      let description = '';
      let message = error.message;

      if (error.options && error.options.description) {
        description = error.options.description;
        message = description + ': ' + message;
      }

      throw new HttpException(message, error.status || 500);
    }
  }
  async sign(
    payload: jwtPayload,
    signOptions?: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.sign(payload, signOptions);
  }
}
