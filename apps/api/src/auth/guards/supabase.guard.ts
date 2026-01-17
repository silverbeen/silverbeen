import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SupabaseGuard extends AuthGuard('supabase') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
