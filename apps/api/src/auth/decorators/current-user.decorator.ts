import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  user_metadata?: {
    is_admin?: boolean;
    role?: string;
    [key: string]: unknown;
  };
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return data ? user[data] : user;
  },
);
