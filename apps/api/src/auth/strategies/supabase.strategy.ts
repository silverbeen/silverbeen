import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  aud: string;
  exp: number;
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private supabase: SupabaseClient;

  constructor() {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET environment variable is required');
    }
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required');
    }
    if (!serviceRoleKey) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY environment variable is required',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    this.supabase = createClient(supabaseUrl, serviceRoleKey);
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    // Supabase에서 사용자 정보 확인
    const { data: user, error } = await this.supabase.auth.admin.getUserById(
      payload.sub,
    );

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
