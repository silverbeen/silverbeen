import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function isAdmin(user: { user_metadata?: { role?: string } } | null): boolean {
  return user?.user_metadata?.role === 'admin';
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isUnauthorizedPage = request.nextUrl.pathname === '/admin/unauthorized';

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
      return NextResponse.redirect(url);
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
