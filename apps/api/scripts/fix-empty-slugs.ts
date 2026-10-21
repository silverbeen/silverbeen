/**
 * 빈 slug('')를 가진 포스트의 slug를 제목 기반으로 재생성하는 일회성 스크립트
 * 실행: pnpm --filter api db:fix-slugs
 * (이전에는 서버 부팅 시마다 PostsService.onModuleInit에서 실행되었음)
 */
import { PrismaClient } from '@prisma/client';
import { generateUniqueSlug, slugExistsCheck } from '../src/common/utils/slug.util';

const prisma = new PrismaClient();

async function main() {
  const postsWithEmptySlugs = await prisma.post.findMany({
    where: { slug: '' },
    select: { id: true, title: true },
  });

  if (postsWithEmptySlugs.length === 0) {
    console.log('No posts with empty slugs.');
    return;
  }

  console.log(`Found ${postsWithEmptySlugs.length} posts with empty slugs. Fixing...`);

  for (const post of postsWithEmptySlugs) {
    const newSlug = await generateUniqueSlug(
      post.title,
      slugExistsCheck(
        (slug) => prisma.post.findUnique({ where: { slug }, select: { id: true } }),
        post.id,
      ),
    );

    await prisma.post.update({
      where: { id: post.id },
      data: { slug: newSlug },
    });

    console.log(`Fixed slug for post "${post.title}": ${newSlug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
