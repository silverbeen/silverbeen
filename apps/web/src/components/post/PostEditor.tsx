'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { TagSelector } from './TagSelector';
import { useTags } from '@/hooks/useTags';
import type { CreatePostDto, Post } from '@/types/post';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface PostEditorProps {
  initialData?: Post;
  onSave: (data: CreatePostDto) => Promise<void>;
  saving?: boolean;
}

export function PostEditor({ initialData, onSave, saving }: PostEditorProps) {
  const { tags, loading: tagsLoading, createTag } = useTags();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags.map((t) => t.id) || []
  );
  const [published, setPublished] = useState(initialData?.published || false);

  const handleSave = async (shouldPublish: boolean) => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const data: CreatePostDto = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      tagIds: selectedTagIds,
      published: shouldPublish,
    };

    await onSave(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="글 제목을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            발췌문 (선택)
          </label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="글 목록에 표시될 짧은 설명"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            커버 이미지 URL (선택)
          </label>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          태그
        </label>
        <TagSelector
          tags={tags}
          selectedTagIds={selectedTagIds}
          onTagsChange={setSelectedTagIds}
          onCreateTag={(name) => createTag({ name })}
          loading={tagsLoading}
        />
      </div>

      <div data-color-mode="auto">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          내용
        </label>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          height={500}
          preview="live"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            바로 발행하기
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? '저장 중...' : '임시저장'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {saving ? '저장 중...' : '발행하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
