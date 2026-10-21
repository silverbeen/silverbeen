/**
 * Supabase app_metadata.role 값이 관리자 권한인지 확인 (대소문자 무시)
 */
export function isAdminRole(role: unknown): boolean {
  return typeof role === 'string' && role.toLowerCase() === 'admin';
}
