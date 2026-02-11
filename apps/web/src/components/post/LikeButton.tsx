'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { getFingerprint } from '@/utils/fingerprint';

interface LikeButtonProps {
  slug: string;
  initialLikeCount: number;
}

export function LikeButton({ slug, initialLikeCount = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const fingerprint = getFingerprint();
    if (!fingerprint) return;

    api.blogs
      .getLikeStatus(slug, fingerprint)
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

    if (!liked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }

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
      className={`group relative flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
        liked
          ? 'border-red-200/80 bg-red-50 text-red-500 shadow-sm shadow-red-100 hover:bg-red-100 hover:shadow-md hover:shadow-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:shadow-none dark:hover:bg-red-500/20'
          : 'border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:bg-red-50/50 hover:text-red-400 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-500 dark:hover:border-red-500/30 dark:hover:bg-red-500/5 dark:hover:text-red-400'
      } ${loading ? 'pointer-events-none opacity-60' : 'active:scale-95'}`}
    >
      <span className="relative">
        <Heart
          className={`h-[18px] w-[18px] transition-all duration-300 ${
            liked
              ? 'fill-red-500 stroke-red-500 dark:fill-red-400 dark:stroke-red-400'
              : 'stroke-current group-hover:stroke-red-400'
          } ${animating ? 'animate-[like-bounce_0.6s_ease-in-out]' : ''}`}
          strokeWidth={liked ? 0 : 1.5}
        />
        {animating && (
          <span className="absolute inset-0 animate-ping">
            <Heart className="h-[18px] w-[18px] fill-red-400/40 stroke-none" strokeWidth={0} />
          </span>
        )}
      </span>
      <span
        className={`tabular-nums transition-colors duration-300 ${liked ? '' : 'group-hover:text-red-400'}`}
      >
        {likeCount.toLocaleString()}
      </span>
    </button>
  );
}
