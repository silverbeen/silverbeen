'use client';

import { useState } from 'react';
import type { Experience } from '@silverbeen/types';
import { Briefcase } from 'lucide-react';
import { ListEditor } from '../../ListEditor';
import { ExperienceCard } from './ExperienceCard';
import { getItemId } from '@/utils/ids';

interface ExperienceEditorProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export function ExperienceEditor({ data, onChange }: ExperienceEditorProps) {
  // 첫 번째 경력을 펼친 상태로 시작 (ID는 폼 초기화 시 부여됨)
  const [expandedId, setExpandedId] = useState<string | null>(() =>
    data.length > 0 ? getItemId(data[0]) : null,
  );

  return (
    <ListEditor
      items={data}
      onChange={onChange}
      createItem={(): Experience => ({
        company: '',
        startDate: '',
        techStack: [],
        projects: [],
      })}
      title="경력"
      description="경력 사항을 시간순으로 정리해주세요"
      icon={Briefcase}
      addLabel="경력 추가"
      itemUnit="경력"
      emptyTitle="경력을 추가해주세요"
      emptyDescription="회사 정보와 프로젝트를 상세히 기록할 수 있습니다"
      onAdded={setExpandedId}
      renderItem={(experience, { id, update, remove }) => (
        <ExperienceCard
          experience={experience}
          expanded={expandedId === id}
          onToggle={() => setExpandedId(expandedId === id ? null : id)}
          onChange={update}
          onRemove={remove}
        />
      )}
    />
  );
}
