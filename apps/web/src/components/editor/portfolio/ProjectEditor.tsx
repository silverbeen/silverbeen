'use client';

import { useState } from 'react';
import type { PortfolioProject } from '@silverbeen/types';
import { FolderOpen } from 'lucide-react';
import { ListEditor } from '../ListEditor';
import { ProjectCard } from './ProjectCard';
import { getItemId } from '@/utils/ids';

interface ProjectEditorProps {
  data: PortfolioProject[];
  onChange: (data: PortfolioProject[]) => void;
}

export function ProjectEditor({ data, onChange }: ProjectEditorProps) {
  // 첫 번째 프로젝트를 펼친 상태로 시작 (ID는 폼 초기화 시 부여됨)
  const [expandedId, setExpandedId] = useState<string | null>(() =>
    data.length > 0 ? getItemId(data[0]) : null,
  );

  return (
    <ListEditor
      items={data}
      onChange={onChange}
      createItem={(): PortfolioProject => ({
        name: '',
        category: 'personal',
        period: '',
        description: '',
        role: '',
        techStack: [],
        tasks: [],
      })}
      title="프로젝트"
      description="진행한 프로젝트를 추가해주세요"
      icon={FolderOpen}
      addLabel="프로젝트 추가"
      itemUnit="프로젝트"
      emptyTitle="프로젝트를 추가해주세요"
      emptyDescription="프로젝트 정보, 기술 스택, 성과 등을 입력할 수 있습니다"
      onAdded={setExpandedId}
      renderItem={(project, { id, update, remove }) => (
        <ProjectCard
          project={project}
          expanded={expandedId === id}
          onToggle={() => setExpandedId(expandedId === id ? null : id)}
          onChange={update}
          onRemove={remove}
        />
      )}
    />
  );
}
