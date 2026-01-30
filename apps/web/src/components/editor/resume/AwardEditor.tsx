'use client';

import type { Award } from '@/types/resume';
import { FormField, inputClassName, AutoTextarea } from '../FormField';
import { SortableList } from '../SortableList';
import { Plus, Trash2, Medal, Calendar, Link as LinkIcon, Tag } from 'lucide-react';

interface AwardEditorProps {
  data: Award[];
  onChange: (data: Award[]) => void;
}

export function AwardEditor({ data, onChange }: AwardEditorProps) {
  const handleAdd = () => {
    const newAward: Award = {
      date: '',
      title: '',
    };
    onChange([...data, newAward]);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updated: Award) => {
    onChange(data.map((item, i) => (i === index ? updated : item)));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary-500" />
            수상
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            수상 경력을 추가해주세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4" />
          수상 추가
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
          <Medal className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            수상 내역을 추가해주세요
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            수상명, 날짜, 설명을 입력할 수 있습니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{data.length}개의 수상</span>
            <span>•</span>
            <span>드래그하여 순서 변경</span>
          </div>
          <SortableList
            items={data}
            getKey={(_, index) => `award-${index}`}
            onReorder={onChange}
            renderItem={(award, index) => (
              <AwardCard
                award={award}
                onChange={(updated) => handleUpdate(index, updated)}
                onRemove={() => handleRemove(index)}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}

interface AwardCardProps {
  award: Award;
  onChange: (award: Award) => void;
  onRemove: () => void;
}

function AwardCard({ award, onChange, onRemove }: AwardCardProps) {
  const handleChange = <K extends keyof Award>(key: K, value: Award[K]) => {
    onChange({ ...award, [key]: value });
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Medal className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {award.title || '새 수상'}
            </h4>
            {award.date && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {award.date}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="수상명" required>
            <div className="relative">
              <Medal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={award.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="해커톤 대상"
              />
            </div>
          </FormField>

          <FormField label="날짜" required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={award.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="2023.10"
              />
            </div>
          </FormField>
        </div>

        <FormField label="설명">
          <AutoTextarea
            value={award.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="수상에 대한 설명 (선택)"
            minRows={2}
            maxRows={6}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="링크">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={award.link || ''}
                onChange={(e) => handleChange('link', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="https://example.com"
              />
            </div>
          </FormField>

          <FormField label="링크 라벨">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={award.linkLabel || ''}
                onChange={(e) => handleChange('linkLabel', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="관련 링크"
              />
            </div>
          </FormField>
        </div>
      </div>
    </div>
  );
}
