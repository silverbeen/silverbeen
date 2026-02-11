import { notFound, redirect } from 'next/navigation';
import { api } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharePage({ params }: PageProps) {
  const { slug } = await params;

  let link;
  try {
    link = await api.share.getBySlug(slug);

    api.share.incrementView(slug).catch(console.error);
  } catch {
    notFound();
  }

  if (!link) notFound();

  if (link.type === 'RESUME') {
    redirect('/resume');
  } else {
    redirect('/portfolio');
  }
}
