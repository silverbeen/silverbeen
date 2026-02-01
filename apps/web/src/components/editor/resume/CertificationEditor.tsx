'use client';

import type { Certification } from '@/types/resume';
import { FormField, inputClassName } from '../FormField';
import { SortableList } from '../SortableList';
import { Plus, Trash2, Award, Calendar, FileCheck } from 'lucide-react';

interface CertificationEditorProps {
  data: Certification[];
  onChange: (data: Certification[]) => void;
}

export function CertificationEditor({ data, onChange }: CertificationEditorProps) {
  const handleAdd = () => {
    const newCert: Certification = {
      name: '',
      date: '',
    };
    onChange([...data, newCert]);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updated: Certification) => {
    onChange(data.map((item, i) => (i === index ? updated : item)));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-primary-500" />
            자격증
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            보유한 자격증을 추가해주세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4" />
          자격증 추가
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
          <Award className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            자격증을 추가해주세요
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            자격증명과 취득일을 입력할 수 있습니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{data.length}개의 자격증</span>
            <span>•</span>
            <span>드래그하여 순서 변경</span>
          </div>
          <SortableList
            items={data}
            getKey={(_, index) => `cert-${index}`}
            onReorder={onChange}
            renderItem={(cert, index) => (
              <CertificationCard
                certification={cert}
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

interface CertificationCardProps {
  certification: Certification;
  onChange: (certification: Certification) => void;
  onRemove: () => void;
}

function CertificationCard({
  certification,
  onChange,
  onRemove,
}: CertificationCardProps) {
  const handleChange = <K extends keyof Certification>(
    key: K,
    value: Certification[K]
  ) => {
    onChange({ ...certification, [key]: value });
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 p-5">
        {/* 아이콘 */}
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl shrink-0">
          <FileCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>

        {/* 폼 필드 */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="자격증명" required>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={certification.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="정보처리기사"
              />
            </div>
          </FormField>

          <FormField label="취득일" required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={certification.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="2023.06"
              />
            </div>
          </FormField>
        </div>

        {/* 삭제 버튼 */}
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
