'use client';

import type { Club } from '@silverbeen/types';
import { FormField, inputClassName, AutoTextarea } from '../FormField';
import { StringArrayField } from '../StringArrayField';
import { ListEditor } from '../ListEditor';
import {
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
  return (
    <ListEditor
      items={data}
      onChange={onChange}
      createItem={(): Club => ({ name: '', role: '', period: '', description: '' })}
      title="동아리/활동"
      description="동아리 및 활동 경험을 추가해주세요"
      icon={Users}
      addLabel="동아리 추가"
      itemUnit="동아리"
      emptyTitle="동아리를 추가해주세요"
      emptyDescription="동아리명, 역할, 활동 내용을 입력할 수 있습니다"
      renderItem={(club, { update, remove }) => (
        <ClubCard club={club} onChange={update} onRemove={remove} />
      )}
    />
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
