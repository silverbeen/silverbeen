/**
 * 폼 에디터 리스트 항목용 클라이언트 전용 ID 유틸.
 *
 * 리스트의 객체 항목에 `_id`를 부여해 React key / dnd-kit ID로 사용한다.
 * `_id`는 서버에 저장하지 않는다 (저장 전 stripIds로 제거, zod 스키마도 미정의 키를 제거).
 */
export const ID_KEY = '_id';

let fallbackCounter = 0;

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  fallbackCounter += 1;
  return `${Date.now().toString(36)}-${fallbackCounter}-${Math.random().toString(36).slice(2, 9)}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 항목의 `_id` (없으면 빈 문자열) */
export function getItemId(item: object): string {
  const id = (item as Record<string, unknown>)[ID_KEY];
  return typeof id === 'string' ? id : '';
}

/** `_id`가 없으면 새 ID를 부여한 사본 반환 */
export function withId<T extends object>(item: T): T {
  return getItemId(item) ? item : { ...item, [ID_KEY]: createId() };
}

/**
 * 데이터 트리 안의 모든 "객체 배열" 항목에 `_id`를 부여 (이미 있으면 유지).
 * 폼 초기화 시점에 한 번 호출해 마운트 후 백필(onChange)이 필요 없도록 한다.
 */
export function assignIds<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) =>
      isPlainObject(item) ? withId(assignIds(item)) : assignIds(item),
    ) as T;
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = assignIds(child);
    }
    return result as T;
  }
  return value;
}

/** 데이터 트리에서 모든 `_id` 키 제거 (저장/JSON 편집용) */
export function stripIds<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripIds(item)) as T;
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (key === ID_KEY) continue;
      result[key] = stripIds(child);
    }
    return result as T;
  }
  return value;
}

/**
 * activeId 항목을 overId 위치로 이동한 새 배열 (드래그 종료 처리용).
 * 이동할 수 없으면 null
 */
export function moveItemById<T extends object>(
  items: T[],
  activeId: string,
  overId: string,
  getId: (item: T) => string = getItemId,
): T[] | null {
  if (activeId === overId) return null;
  const from = items.findIndex((item) => getId(item) === activeId);
  const to = items.findIndex((item) => getId(item) === overId);
  if (from === -1 || to === -1) return null;

  const result = [...items];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}
