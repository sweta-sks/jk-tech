import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PermissionEnum } from 'src/role/enums/permissions.enum';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

export interface jwtPayload {
  id: string;
}

export interface AuthenticatedUser extends jwtPayload {
  role: string;
  email: string;
  permissions: PermissionEnum[] | string[];
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('token.jwt.secret'),
    });
  }

  async validate(payload: jwtPayload): Promise<any> {
    const user = await this.userService.jwtValidate(payload);

    return user;
  }
}
