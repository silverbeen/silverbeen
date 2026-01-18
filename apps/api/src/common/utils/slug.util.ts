import slugify from 'slugify';

export function generateSlug(title: string): string {
  // 먼저 slugify 시도
  const slug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'ko',
  });

  // 결과가 비어있으면 (한글만 있는 경우) 타임스탬프 기반 슬러그 생성
  if (!slug || slug.trim() === '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `post-${timestamp}-${random}`;
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
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
