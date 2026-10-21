import slugify from 'slugify';
import { isPrismaError } from './prisma-error.util';

/** slug 중복 탐색 최대 횟수 (초과 시 랜덤 접미사 사용) */
const MAX_SLUG_ATTEMPTS = 100;

/** 동시 생성으로 unique 제약 위반 시 재시도 횟수 */
const MAX_PERSIST_ATTEMPTS = 3;

function randomSuffix(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

export function generateSlug(title: string): string {
  // 먼저 slugify 시도
  const slug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'ko',
  });

  // 결과가 비어있으면 (한글만 있는 경우) 타임스탬프 기반 슬러그 생성
  if (!slug || slug.trim() === '') {
    return `post-${randomSuffix()}`;
  }

  return slug;
}

export async function generateUniqueSlug(
  title: string,
  existsCheck: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (await existsCheck(slug)) {
    if (counter >= MAX_SLUG_ATTEMPTS) {
      return `${baseSlug}-${randomSuffix()}`;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * slug 존재 여부 확인 함수 생성
 * excludeId를 넘기면 해당 레코드 자신의 slug는 중복으로 보지 않음 (수정 시)
 */
export function slugExistsCheck<TId extends string | number>(
  findBySlug: (slug: string) => Promise<{ id: TId } | null>,
  excludeId?: TId,
): (slug: string) => Promise<boolean> {
  return async (slug) => {
    const existing = await findBySlug(slug);
    return !!existing && existing.id !== excludeId;
  };
}

/**
 * 고유 slug를 생성하여 저장
 * 확인-저장 사이의 경쟁 상태로 slug unique 제약(P2002)이 위반되면 slug를 다시 생성해 재시도
 */
export async function persistWithUniqueSlug<T>(
  title: string,
  existsCheck: (slug: string) => Promise<boolean>,
  persist: (slug: string) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const slug = await generateUniqueSlug(title, existsCheck);
    try {
      return await persist(slug);
    } catch (err) {
      if (attempt < MAX_PERSIST_ATTEMPTS && isPrismaError(err, 'P2002', 'slug')) {
        continue;
      }
      throw err;
    }
  }
}
