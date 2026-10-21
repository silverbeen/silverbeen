'use client';

import type { Certification } from '@silverbeen/types';
import { FormField, inputClassName } from '../FormField';
import { ListEditor } from '../ListEditor';
import { Trash2, Award, Calendar, FileCheck } from 'lucide-react';

interface CertificationEditorProps {
  data: Certification[];
  onChange: (data: Certification[]) => void;
}

export function CertificationEditor({ data, onChange }: CertificationEditorProps) {
  return (
    <ListEditor
      items={data}
      onChange={onChange}
      createItem={(): Certification => ({ name: '', date: '' })}
      title="자격증"
      description="보유한 자격증을 추가해주세요"
      icon={Award}
      addLabel="자격증 추가"
      itemUnit="자격증"
      emptyTitle="자격증을 추가해주세요"
      emptyDescription="자격증명과 취득일을 입력할 수 있습니다"
      renderItem={(certification, { update, remove }) => (
        <CertificationCard certification={certification} onChange={update} onRemove={remove} />
      )}
    />
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
