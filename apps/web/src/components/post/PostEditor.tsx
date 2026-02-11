'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TagSelector } from './TagSelector';
import { SeriesSelector } from './SeriesSelector';
import { MarkdownImageButton } from './MarkdownImageButton';
import { DraftBanner } from './DraftBanner';
import { useTags } from '@/hooks/useTags';
import { useMarkdownImage } from '@/hooks/useMarkdownImage';
import { useAutoSave } from '@/hooks/useAutoSave';
import { loadDraft as loadDraftUtil } from '@/utils/draft';
import { useToast, ImageUpload } from '@/components/ui';
import type { CreatePostDto, Post } from '@/types/post';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface PostEditorProps {
  initialData?: Post;
  onSave: (data: CreatePostDto) => Promise<void>;
  saving?: boolean;
}

export function PostEditor({ initialData, onSave, saving }: PostEditorProps) {
  const { tags, loading: tagsLoading, createTag } = useTags();
  const { toast } = useToast();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags.map((t) => t.id) || [],
  );
  const [seriesId, setSeriesId] = useState<string | null>(initialData?.seriesId || null);
  const [published, setPublished] = useState(initialData?.published || false);
  const [createdAt, setCreatedAt] = useState(() => {
    if (initialData?.createdAt) {
      return new Date(initialData.createdAt).toISOString().slice(0, 16);
    }
    return '';
  });
  const [draftAvailable, setDraftAvailable] = useState(() => {
    const draft = loadDraftUtil(initialData?.id);
    return !!(draft?.savedAt);
  });
  const [draftSavedAt] = useState<string | null>(() => {
    const draft = loadDraftUtil(initialData?.id);
    return draft?.savedAt ?? null;
  });

  // 임시 저장 훅
  const {
    updateState,
    setInitialState,
    save: saveDraftNow,
    load: loadDraft,
    discard: discardDraft,
    lastSaved,
  } = useAutoSave({ postId: initialData?.id });

  // 초기 상태 설정 및 드래프트 확인
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initial = {
      title: initialData?.title || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      coverImage: initialData?.coverImage || '',
      tagIds: initialData?.tags.map((t) => t.id) || [],
    };
    setInitialState(initial);
  }, [initialData, setInitialState]);

  // 상태 변경 시 auto-save에 반영 (초기화 완료 후에만)
  useEffect(() => {
    if (!initializedRef.current) return;
    updateState({ title, content, excerpt, coverImage, tagIds: selectedTagIds });
  }, [title, content, excerpt, coverImage, selectedTagIds, updateState]);

  const handleRestoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (!draft) return;
    setTitle(draft.title);
    setContent(draft.content);
    setExcerpt(draft.excerpt);
    setCoverImage(draft.coverImage);
    if (draft.tagIds?.length) setSelectedTagIds(draft.tagIds);
    setDraftAvailable(false);
    toast('임시 저장된 글을 복원했습니다.', 'success');
  }, [loadDraft, toast]);

  const handleDiscardDraft = useCallback(() => {
    discardDraft();
    setDraftAvailable(false);
    toast('임시 저장을 삭제했습니다.', 'info');
  }, [discardDraft, toast]);

  // 마크다운 이미지 업로드 훅
  const { uploading, handleFileUpload, bindDropEvents, bindPasteEvents } = useMarkdownImage({
    onInsert: (markdown) => setContent((prev) => prev + markdown),
    folder: 'posts',
  });

  // 에디터에 드래그앤드롭, 붙여넣기 이벤트 바인딩
  useEffect(() => {
    const container = editorContainerRef.current;
    if (container) {
      bindDropEvents(container);
      bindPasteEvents(container);
    }
  }, [bindDropEvents, bindPasteEvents]);

  const handleSave = async (shouldPublish: boolean) => {
    if (!title.trim()) {
      toast('제목을 입력해주세요.', 'warning');
      return;
    }
    if (!content.trim()) {
      toast('내용을 입력해주세요.', 'warning');
      return;
    }

    const data: CreatePostDto = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      tagIds: selectedTagIds,
      published: shouldPublish,
      createdAt: createdAt ? new Date(createdAt).toISOString() : undefined,
      seriesId: initialData ? (seriesId ?? undefined) : seriesId || undefined,
    };

    await onSave(data);
    discardDraft();
  };

  return (
    <div className="space-y-6">
      {draftAvailable && draftSavedAt && (
        <DraftBanner
          savedAt={draftSavedAt}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="글 제목을 입력하세요"
          className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          발췌문 (선택)
        </label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="글 목록에 표시될 짧은 설명"
          className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          커버 이미지 (선택)
        </label>
        <ImageUpload value={coverImage} onChange={setCoverImage} folder="covers" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          시리즈 (선택)
        </label>
        <SeriesSelector selectedSeriesId={seriesId} onSeriesChange={setSeriesId} />
      </div>

      {initialData && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            작성일
          </label>
          <input
            type="datetime-local"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}

      <div data-color-mode="auto" ref={editorContainerRef}>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
          <div className="flex items-center gap-2">
            <MarkdownImageButton onFileSelect={handleFileUpload} uploading={uploading} />
            {uploading && (
              <span className="text-xs text-gray-500 dark:text-gray-400">업로드 중...</span>
            )}
          </div>
        </div>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          height={500}
          preview="live"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          이미지를 드래그하거나 Ctrl+V로 붙여넣기 가능
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">바로 발행하기</span>
          </label>
          {lastSaved && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              자동 저장됨{' '}
              {new Date(lastSaved).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              const saved = saveDraftNow();
              toast(
                saved ? '임시 저장되었습니다.' : '변경 사항이 없습니다.',
                saved ? 'info' : 'warning',
              );
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            로컬 저장
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {saving ? '저장 중...' : '임시저장'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-primary-500 hover:bg-primary-600 rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '발행하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
