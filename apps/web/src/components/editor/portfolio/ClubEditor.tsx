'use client';

import type { Club } from '@/types/portfolio';
import { FormField, inputClassName, AutoTextarea } from '../FormField';
import { StringArrayField } from '../ArrayField';
import { SortableList } from '../SortableList';
import {
  Plus,
  Trash2,
  Users,
  Calendar,
  Link as LinkIcon,
  UserCircle,
} from 'lucide-react';

interface ClubEditorProps {
  data: Club[];
  onChange: (data: Club[]) => void;
}

export function ClubEditor({ data, onChange }: ClubEditorProps) {
  const handleAdd = () => {
    const newClub: Club = {
      name: '',
      role: '',
      period: '',
      description: '',
    };
    onChange([...data, newClub]);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updated: Club) => {
    onChange(data.map((item, i) => (i === index ? updated : item)));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-500" />
            동아리/활동
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            동아리 및 활동 경험을 추가해주세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4" />
          동아리 추가
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
          <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            동아리를 추가해주세요
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            동아리명, 역할, 활동 내용을 입력할 수 있습니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{data.length}개의 동아리</span>
            <span>•</span>
            <span>드래그하여 순서 변경</span>
          </div>
          <SortableList
            items={data}
            getKey={(_, index) => `club-${index}`}
            onReorder={onChange}
            renderItem={(club, index) => (
              <ClubCard
                club={club}
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

interface ClubCardProps {
  club: Club;
  onChange: (club: Club) => void;
  onRemove: () => void;
}

function ClubCard({ club, onChange, onRemove }: ClubCardProps) {
  const handleChange = <K extends keyof Club>(key: K, value: Club[K]) => {
    onChange({ ...club, [key]: value });
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {club.name || '새 동아리'}
            </h4>
            {club.role && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {club.role}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="동아리명" required>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={club.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="동아리명"
              />
            </div>
          </FormField>

          <FormField label="역할" required>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={club.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="회장, 팀원 등"
              />
            </div>
          </FormField>

          <FormField label="기간" required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={club.period}
                onChange={(e) => handleChange('period', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="2022.03 ~ 2023.12"
              />
            </div>
          </FormField>
        </div>

        <FormField label="설명" required>
          <AutoTextarea
            value={club.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="동아리 활동에 대한 설명"
            minRows={3}
            maxRows={8}
          />
        </FormField>

        <StringArrayField
          label="주요 활동"
          items={club.activities || []}
          onChange={(items) => handleChange('activities', items)}
          placeholder="활동 내용 입력"
          addLabel="활동 추가"
        />

        <FormField label="링크">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              value={club.link || ''}
              onChange={(e) => handleChange('link', e.target.value)}
              className={`${inputClassName} pl-10`}
              placeholder="https://example.com"
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}
