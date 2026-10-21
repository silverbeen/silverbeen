import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 브라우저용 Supabase 클라이언트.
 * 렌더 중이 아닌 이벤트 핸들러/useEffect 안에서만 호출할 것 (SSR/빌드 시점에는 환경변수가 없을 수 있음)
 */
export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * 현재 세션의 access token. 로그인하지 않았으면 null
 */
export async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await createClient().auth.getSession();
  return session?.access_token ?? null;
}
