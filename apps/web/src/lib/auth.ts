import type { User } from '@supabase/supabase-js';

/**
 * Supabase 유저의 app_metadata.role 기준 어드민 여부
 */
export function isAdmin(user: Pick<User, 'app_metadata'> | null | undefined): boolean {
  const role = user?.app_metadata?.role;
  return typeof role === 'string' && role.toLowerCase() === 'admin';
}
