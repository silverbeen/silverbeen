import { MetadataRoute } from 'next';
import { config } from '@/config';

interface PostForSitemap {
  id: number;
  slug: string;
  updatedAt: string;
}

async function getAllPosts(): Promise<PostForSitemap[]> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/posts?limit=1000`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.posts || [];
  } catch {
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
      priority: 0.9,
    },
    {
      url: `${config.siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${config.siteUrl}/blog/${post.id}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
