# 인증/인가 시스템

## 개요

Supabase Auth를 사용한 JWT 기반 인증 시스템

- **인증 제공자**: Supabase Auth
- **토큰 형식**: JWT (ES256 서명)
- **권한 관리**: Role 기반 (USER, ADMIN)

## 인증 플로우

```text
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Client  │────▶│ Supabase Auth│────▶│   JWT 발급   │
└──────────┘     └──────────────┘     └──────────────┘
     │                                       │
     │         ┌─────────────────────────────┘
     ▼         ▼
┌──────────────────┐     ┌──────────────┐     ┌──────────┐
│ Authorization:   │────▶│ SupabaseGuard│────▶│ Controller│
│ Bearer <token>   │     │ (JWT 검증)   │     └──────────┘
└──────────────────┘     └──────────────┘
```

### 단계별 설명

1. **로그인 요청**: 사용자가 이메일/비밀번호 또는 OAuth로 로그인
2. **토큰 발급**: Supabase가 JWT access_token 발급
3. **API 요청**: 클라이언트가 Authorization 헤더에 토큰 포함
4. **토큰 검증**: NestJS SupabaseGuard가 JWKS로 서명 검증
5. **권한 확인**: AdminGuard가 사용자 역할 확인
6. **요청 처리**: 인증된 요청 처리

## 백엔드 구현

### SupabaseGuard

JWT 토큰 유효성 검증

```typescript
// apps/api/src/auth/guards/supabase.guard.ts
@Injectable()
export class SupabaseGuard extends AuthGuard('supabase') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

#### 검증 항목

- 토큰 서명 (JWKS 사용)
- 토큰 만료 시간
- 발급자 (issuer)

### AdminGuard

관리자 권한 확인

```typescript
// apps/api/src/auth/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 관리자 판별 조건 (다중 체크)
    const isAdmin =
      user?.is_admin === true ||
      user?.is_admin === 'true' ||
      user?.is_admin === '1' ||
      user?.user_metadata?.is_admin === true ||
      user?.user_metadata?.is_admin === 'true' ||
      user?.user_metadata?.is_admin === '1' ||
      user?.role?.toLowerCase() === 'admin' ||
      user?.user_metadata?.role?.toLowerCase() === 'admin';

    if (!isAdmin) {
      throw new ForbiddenException('관리자 권한이 필요합니다');
    }

    return true;
  }
}
```

### Supabase Strategy

Passport 전략 구현

```typescript
// apps/api/src/auth/strategies/supabase.strategy.ts
@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        // JWKS에서 공개키 가져오기
        const key = await this.getKey(rawJwtToken);
        done(null, key);
      },
      algorithms: ['ES256'],
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      is_admin: payload.is_admin,
      user_metadata: payload.user_metadata,
    };
  }
}
```

### CurrentUser 데코레이터

컨트롤러에서 사용자 정보 접근

```typescript
// apps/api/src/auth/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

#### 사용 예시

```typescript
@Post()
@UseGuards(SupabaseGuard, AdminGuard)
create(@Body() dto: CreatePostDto, @CurrentUser() user: AuthUser) {
  return this.postsService.create(dto, user.id);
}
```

### AuthUser 타입

```typescript
interface AuthUser {
  id: string;           // Supabase user ID
  email: string;
  role: string;
  is_admin?: boolean | string;
  user_metadata?: {
    is_admin?: boolean | string;
    role?: string;
  };
}
```

## 프론트엔드 구현

### Supabase 클라이언트

```typescript
// apps/web/src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### 서버 클라이언트

```typescript
// apps/web/src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
};
```

### 미들웨어 (라우트 보호)

```typescript
// apps/web/src/middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request, res: response });
  const { data: { session } } = await supabase.auth.getSession();

  // /admin 경로 보호
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const isAdmin = session.user.user_metadata?.role === 'admin' ||
                    session.user.user_metadata?.is_admin === true;

    if (!isAdmin && !request.nextUrl.pathname.includes('/login')) {
      return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

## 로그인 구현

### 이메일/비밀번호 로그인

```typescript
const handleLogin = async (email: string, password: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
```

### OAuth 로그인 (예: GitHub)

```typescript
const handleOAuthLogin = async () => {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};
```

### OAuth 콜백 처리

```typescript
// apps/web/src/app/auth/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/', request.url));
}
```

## API 요청 시 토큰 전달

```typescript
// apps/web/src/lib/api/client.ts
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
  });
};
```

### API 클라이언트 사용 예시

```typescript
// 포스트 생성 (인증 필요)
const token = session?.access_token;
const newPost = await postsApi.create(postData, token);
```

## 권한 매트릭스

| 엔드포인트 | 비인증 | USER | ADMIN |
|-----------|--------|------|-------|
| GET /posts | ✅ | ✅ | ✅ |
| GET /posts/:id | ✅ | ✅ | ✅ |
| POST /posts | ❌ | ❌ | ✅ |
| PUT /posts/:id | ❌ | ❌ | ✅ (본인) |
| DELETE /posts/:id | ❌ | ❌ | ✅ (본인) |
| GET /tags | ✅ | ✅ | ✅ |
| POST /tags | ❌ | ❌ | ✅ |
| DELETE /tags/:id | ❌ | ❌ | ✅ |
| GET /resume | ✅ | ✅ | ✅ |
| PUT /resume | ❌ | ❌ | ✅ |

## Supabase 관리자 설정

### 사용자를 관리자로 설정

Supabase 대시보드 > Authentication > Users에서:

1. 사용자 선택
2. User Metadata 수정:

```json
{
  "role": "admin",
  "is_admin": true
}
```

### SQL로 설정

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "is_admin": true}'::jsonb
WHERE email = 'admin@example.com';
```

## 보안 고려사항

### 토큰 관리

- Access Token 만료: 1시간 (Supabase 기본)
- Refresh Token 자동 갱신

### CORS 설정

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

### 환경 변수

```env
# Backend
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret

# Frontend
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**주의**: `SUPABASE_JWT_SECRET`은 절대 클라이언트에 노출하지 않음

## 트러블슈팅

### "Unauthorized" 에러

1. 토큰 만료 확인 → 재로그인
2. Authorization 헤더 형식 확인 (`Bearer ` 접두사)
3. 환경 변수 확인

### "Forbidden" 에러

1. 사용자 metadata에 admin role 확인
2. Supabase 대시보드에서 user_metadata 확인

### 토큰 갱신 실패

```typescript
// 자동 갱신 설정
const supabase = createClient();
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});
```
