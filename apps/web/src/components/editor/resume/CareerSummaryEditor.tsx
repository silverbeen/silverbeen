'use client';

import type { CareerSummary } from '@/types/resume';
import { FormField, inputClassName } from '../FormField';
import { SortableList } from '../SortableList';
import { Plus, Trash2, Briefcase, Calendar, User, FileText } from 'lucide-react';

interface CareerSummaryEditorProps {
  data: CareerSummary[];
  onChange: (data: CareerSummary[]) => void;
}

export function CareerSummaryEditor({ data, onChange }: CareerSummaryEditorProps) {
  const handleAdd = () => {
    const newCareer: CareerSummary = {
      company: '',
      position: '',
      startDate: '',
    };
    onChange([...data, newCareer]);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updated: CareerSummary) => {
    onChange(data.map((item, i) => (i === index ? updated : item)));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary-500" />
            경력
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            회사명, 직책, 근무 기간을 입력해주세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4" />
          경력 추가
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
          <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            경력을 추가해주세요
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            회사명, 직책, 근무 기간 정보를 입력할 수 있습니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{data.length}개의 경력</span>
            <span>•</span>
            <span>드래그하여 순서 변경</span>
          </div>
          <SortableList
            items={data}
            getKey={(career, index) => `${career.company}-${career.startDate}-${index}`}
            onReorder={onChange}
            renderItem={(career, index) => (
              <CareerCard
                career={career}
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

interface CareerCardProps {
  career: CareerSummary;
  onChange: (career: CareerSummary) => void;
  onRemove: () => void;
}

function CareerCard({ career, onChange, onRemove }: CareerCardProps) {
  const handleChange = <K extends keyof CareerSummary>(
    key: K,
    value: CareerSummary[K]
  ) => {
    onChange({ ...career, [key]: value });
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <Briefcase className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {career.company || '새 경력'}
            </h4>
            {career.position && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {career.position}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="경력 삭제"
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="회사명" required>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={career.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="(주) 회사명"
              />
            </div>
          </FormField>

          <FormField label="직책" required>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={career.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="Frontend Developer"
              />
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="시작일" required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={career.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="2022.07"
              />
            </div>
          </FormField>

          <FormField label="종료일">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={career.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value || undefined)}
                className={`${inputClassName} pl-10`}
                placeholder="재직중이면 비워두세요"
              />
            </div>
          </FormField>
        </div>

        <FormField label="업무 설명">
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={career.description || ''}
              onChange={(e) => handleChange('description', e.target.value || undefined)}
              className={`${inputClassName} pl-10`}
              placeholder="AI 캐릭터 채팅 & 채팅형 웹소설 플랫폼 개발"
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}
