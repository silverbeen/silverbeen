import { Prisma } from '@prisma/client';

/**
 * Prisma 알려진 에러 코드 확인
 * - P2002: unique 제약 위반
 * - P2003: 외래 키 제약 위반
 * - P2025: 대상 레코드 없음
 * field를 넘기면 P2002의 meta.target에 해당 필드가 포함된 경우만 true
 */
export function isPrismaError(
  err: unknown,
  code: string,
  field?: string,
): err is Prisma.PrismaClientKnownRequestError {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== code) {
    return false;
  }
  if (!field) return true;

  const target = err.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === 'string') return target.includes(field);
  return false;
}
