'use client';

import { useState } from 'react';
import type { Tag } from '@/types/blog';

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag: (name: string) => Promise<Tag>;
  loading?: boolean;
}

export function TagSelector({
  tags,
  selectedTagIds,
  onTagsChange,
  onCreateTag,
  loading,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setCreating(true);
    try {
      const newTag = await onCreateTag(newTagName.trim());
      onTagsChange([...selectedTagIds, newTag.id]);
      setNewTagName('');
    } catch {
      alert('태그 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  if (loading) {
    return (
      <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    );
  }

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer flex flex-wrap gap-1 items-center"
      >
        {selectedTags.length === 0 ? (
          <span className="text-gray-400">태그를 선택하세요</span>
        ) : (
          selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded"
            >
              {tag.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTag(tag.id);
                }}
                className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="새 태그 이름"
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateTag();
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTag();
                  }}
                  disabled={creating || !newTagName.trim()}
                  className="px-2 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
                >
                  {creating ? '...' : '추가'}
                </button>
              </div>
            </div>
            <div className="p-2">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  태그가 없습니다
                </p>
              ) : (
                <div className="space-y-1">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
