import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogoutDto } from './dto/logout.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../utils/decorators/public.decorator';

import { ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from '../utils/decorators/current-user.decorator';
import { AuthenticatedUser } from './strategies/jwt.strategy';

@Controller('auth')
@ApiSecurity('bearer')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  create(@Body() loginDto: LoginDto) {
    return this.authService.authenticateUser(loginDto);
  }

  @Post('logout')
  remove(
    @Body() logoutDto: LogoutDto,
    @Req() req: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return user;
  }
}
