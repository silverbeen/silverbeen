/**
 * unknown 에러를 Error 인스턴스로 정규화
 */
export function toError(err: unknown, fallbackMessage = '알 수 없는 오류가 발생했습니다.'): Error {
  if (err instanceof Error) return err;
  if (typeof err === 'string' && err) return new Error(err);
  return new Error(fallbackMessage);
}
