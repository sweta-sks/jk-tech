import { ForbiddenError } from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory/casl-ability.factory';
import { PermissionEnum } from '../../role/enums/permissions.enum';
import {
  CHECK_ABILITIES_KEY,
  RequiredRule,
} from '../../utils/decorators/ability.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  getActionFromMethod(method: string): PermissionEnum {
    const actions = {
      POST: PermissionEnum.CREATE,
      GET: PermissionEnum.READ,

      PATCH: PermissionEnum.UPDATE,
      DELETE: PermissionEnum.DELETE,
    };

    return actions[method];
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    let rules =
      this.reflector.get<RequiredRule[]>(
        CHECK_ABILITIES_KEY,
        context.getHandler(),
      ) || [];

    const req = context.switchToHttp().getRequest();

    if (!rules || rules.length === 0) {
      const action = this.getActionFromMethod(req.method);

      rules = [];

      rules.push({ action, subject: 'all' });
    }

    const ability = this.caslAbilityFactory.createForUser(req.user);

    try {
      rules.forEach((rule) =>
        ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject),
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new HttpException(
          ` You are not authorized to perform this action`,
          403,
        );
      }
    }
  }
}
