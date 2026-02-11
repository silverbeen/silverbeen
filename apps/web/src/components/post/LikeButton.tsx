'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { getFingerprint } from '@/utils/fingerprint';

interface LikeButtonProps {
  slug: string;
  initialLikeCount: number;
}

export function LikeButton({ slug, initialLikeCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fingerprint = getFingerprint();
    if (!fingerprint) return;

    api.blogs.getLikeStatus(slug, fingerprint)
      .then((res) => {
        setLiked(res.liked);
        setLikeCount(res.likeCount);
      })
      .catch((err) => {
        console.error('Failed to fetch like status:', err);
      });
  }, [slug]);

  const handleToggleLike = async () => {
    if (loading) return;

    const fingerprint = getFingerprint();
    if (!fingerprint) return;

    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setLoading(true);

    try {
      const res = await api.blogs.toggleLike(slug, fingerprint);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        liked
          ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart
        className={`h-4 w-4 transition-all ${liked ? 'fill-current scale-110' : ''}`}
      />
      <span>{likeCount}</span>
    </button>
  );
}
