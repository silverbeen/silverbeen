'use client';

import type { Education } from '@silverbeen/types';
import { FormField, inputClassName, AutoTextarea } from '../FormField';
import { ListEditor } from '../ListEditor';
import { Trash2, GraduationCap, Calendar, BookOpen } from 'lucide-react';

interface EducationEditorProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export function EducationEditor({ data, onChange }: EducationEditorProps) {
  return (
    <ListEditor
      items={data}
      onChange={onChange}
      createItem={(): Education => ({ school: '', major: '', period: '' })}
      title="학력"
      description="학력 사항을 입력해주세요"
      icon={GraduationCap}
      addLabel="학력 추가"
      itemUnit="학력"
      emptyTitle="학력을 추가해주세요"
      emptyDescription="학교, 전공, 기간 정보를 입력할 수 있습니다"
      renderItem={(education, { update, remove }) => (
        <EducationCard education={education} onChange={update} onRemove={remove} />
      )}
    />
  );
}

interface EducationCardProps {
  education: Education;
  onChange: (education: Education) => void;
  onRemove: () => void;
}

function EducationCard({ education, onChange, onRemove }: EducationCardProps) {
  const handleChange = <K extends keyof Education>(
    key: K,
    value: Education[K]
  ) => {
    onChange({ ...education, [key]: value });
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {education.school || '새 학력'}
            </h4>
            {education.major && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {education.major}
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
          <FormField label="학교명" required>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={education.school}
                onChange={(e) => handleChange('school', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="대학교명"
              />
            </div>
          </FormField>

          <FormField label="전공" required>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={education.major}
                onChange={(e) => handleChange('major', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="컴퓨터공학과"
              />
            </div>
          </FormField>

          <FormField label="기간" required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={education.period}
                onChange={(e) => handleChange('period', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="2018.03 ~ 2022.02"
              />
            </div>
          </FormField>
        </div>

        <FormField label="설명">
          <AutoTextarea
            value={education.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="학력에 대한 추가 설명 (선택)"
            minRows={2}
            maxRows={6}
          />
        </FormField>
      </div>
    </div>
  );
}
