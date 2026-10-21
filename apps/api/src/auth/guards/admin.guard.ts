import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { AuthUser } from '../decorators/current-user.decorator';
import { isAdminRole } from '../../common/utils/role.util';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!isAdminRole(user.app_metadata?.role)) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
