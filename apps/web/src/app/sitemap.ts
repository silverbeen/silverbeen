import { MetadataRoute } from 'next';
import { config } from '@/config';
import { api } from '@/lib/api';

interface PostForSitemap {
  id: number;
  slug: string;
  updatedAt: string;
}

// API의 limit 상한(@Max(100))에 맞춰 페이지 단위로 조회
const SITEMAP_PAGE_SIZE = 100;

async function getAllPosts(): Promise<PostForSitemap[]> {
  try {
    const fetchPage = (page: number) =>
      api.blogs.getList({ page, limit: SITEMAP_PAGE_SIZE }, { revalidate: 3600 });

    const first = await fetchPage(1);
    const restPages = Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, i) => i + 2);
    const rest = await Promise.all(restPages.map(fetchPage));

    return [first, ...rest].flatMap(({ posts }) => posts ?? []);
  } catch (error) {
    console.error('Failed to fetch posts for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: config.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${config.siteUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${config.siteUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${config.siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${config.siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...postRoutes];
}
