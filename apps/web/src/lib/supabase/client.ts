import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // 빌드 시점에는 환경변수가 없을 수 있음 - 런타임에서만 에러 발생
    if (typeof window !== 'undefined') {
      throw new Error(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }
    // SSG 빌드 시점에는 더미 클라이언트 반환 (실제로 사용되지 않음)
    return null as never;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
