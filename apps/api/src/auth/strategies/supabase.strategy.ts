import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  aud: string;
  exp: number;
  user_metadata?: {
    role?: string;
    is_admin?: boolean;
    [key: string]: unknown;
  };
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      user_metadata: payload.user_metadata,
    };
  }
}
