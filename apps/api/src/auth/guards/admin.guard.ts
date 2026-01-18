import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // is_admin 플래그 또는 role 확인 (대소문자 구분 없음)
    const isAdminFlag =
      user.is_admin === true ||
      user.is_admin === 'true' ||
      user.is_admin === '1' ||
      user.user_metadata?.is_admin === true ||
      user.user_metadata?.is_admin === 'true' ||
      user.user_metadata?.is_admin === '1';

    const isAdminRole =
      user.role?.toLowerCase() === 'admin' ||
      user.user_metadata?.role?.toLowerCase() === 'admin';

    const isAdmin = isAdminFlag || isAdminRole;

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
