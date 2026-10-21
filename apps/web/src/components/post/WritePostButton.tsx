'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuthUser';

export function WritePostButton() {
  const { isAdmin } = useAuthUser();

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin/posts/new"
      className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600 hover:scale-110"
      title="새 글 작성"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
