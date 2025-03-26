import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();

    const ua = request.get('user-agent') || '-';

    if (request?.user?.ip) {
      return {
        ...(request.user || {}),
        ua,
      };
    }

    let ip =
      request.headers['x-forwarded-for'] || request.socket.remoteAddress || '';

    ip = ip.substr(0, 7) == '::ffff:' ? ip.substr(7) : ip;

    return {
      ...(request.user || {}),
      ip,
      ua,
    };
  },
);
