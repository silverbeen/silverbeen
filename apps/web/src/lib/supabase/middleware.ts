import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function isAdmin(user: { app_metadata: Record<string, unknown> } | null): boolean {
  return (user?.app_metadata?.role as string)?.toLowerCase() === 'admin';
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // 환경변수가 없으면 인증 체크 없이 통과
    console.warn('Missing Supabase environment variables in middleware');
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isUnauthorizedPage =
    request.nextUrl.pathname === '/admin/unauthorized';

  // 로그인하지 않은 사용자가 어드민 페이지 접근 시 로그인 페이지로
  if (!user && isAdminRoute && !isLoginPage && !isUnauthorizedPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // 로그인했지만 admin role이 아닌 경우
  if (user && isAdminRoute && !isLoginPage && !isUnauthorizedPage) {
    if (!isAdmin(user)) {
      // 로그아웃 처리 후 unauthorized 페이지로 리다이렉트
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/admin/unauthorized';
      const redirectResponse = NextResponse.redirect(url);

      // signOut으로 설정된 쿠키를 리다이렉트 응답에 복사
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });

      return redirectResponse;
    }
  }

  // admin role 사용자가 로그인 페이지 접근 시 어드민 대시보드로 리다이렉트
  if (user && isLoginPage && isAdmin(user)) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
