'use client';

import { useState } from 'react';
import type { PortfolioProject } from '@/types/portfolio';
import { SortableList } from '../SortableList';
import { ProjectCard } from './ProjectCard';
import { FolderOpen, Plus } from 'lucide-react';

interface ProjectEditorProps {
  data: PortfolioProject[];
  onChange: (data: PortfolioProject[]) => void;
}

// 고유 ID 생성 함수
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// 모듈 레벨 ID 캐시 - 컴포넌트 외부에서 관리
const projectIdCache = new WeakMap<PortfolioProject, string>();

// 프로젝트에 안정적인 ID 부여
const getProjectId = (project: PortfolioProject): string => {
  // 이미 _id 속성이 있으면 사용
  const existing = (project as PortfolioProject & { _id?: string })._id;
  if (existing) return existing;

  // 캐시에 있으면 사용
  let id = projectIdCache.get(project);
  if (!id) {
    id = generateId();
    projectIdCache.set(project, id);
  }
  return id;
};

export function ProjectEditor({ data, onChange }: ProjectEditorProps) {
  // 첫 번째 프로젝트 ID를 초기 확장 상태로 설정
  const [expandedId, setExpandedId] = useState<string | null>(() =>
    data.length > 0 ? getProjectId(data[0]) : null
  );

  const handleAdd = () => {
    const newId = generateId();
    const newProject = {
      _id: newId,
      name: '',
      category: 'personal' as const,
      period: '',
      description: '',
      role: '',
      techStack: [],
      tasks: [],
    } as PortfolioProject & { _id: string };
    onChange([...data, newProject]);
    setExpandedId(newId);
  };

  const handleRemove = (id: string) => {
    const index = data.findIndex((p) => getProjectId(p) === id);
    if (index === -1) return;
    onChange(data.filter((_, i) => i !== index));
    if (expandedId === id) setExpandedId(null);
  };

  const handleUpdate = (id: string, updated: PortfolioProject) => {
    const index = data.findIndex((p) => getProjectId(p) === id);
    if (index === -1) return;
    // ID를 유지하여 업데이트
    const updatedWithId = { ...updated, _id: id };
    onChange(data.map((item, i) => (i === index ? updatedWithId : item)));
  };

  const handleReorder = (reordered: PortfolioProject[]) => {
    onChange(reordered);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary-500" />
            프로젝트
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            진행한 프로젝트를 추가해주세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          프로젝트 추가
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
          <FolderOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            프로젝트를 추가해주세요
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            프로젝트 정보, 기술 스택, 성과 등을 입력할 수 있습니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{data.length}개의 프로젝트</span>
            <span>•</span>
            <span>드래그하여 순서 변경</span>
          </div>
          <SortableList
            items={data}
            getKey={(project) => getProjectId(project)}
            onReorder={handleReorder}
            renderItem={(project) => {
              const projectId = getProjectId(project);
              return (
                <ProjectCard
                  project={project}
                  expanded={expandedId === projectId}
                  onToggle={() =>
                    setExpandedId(expandedId === projectId ? null : projectId)
                  }
                  onChange={(updated) => handleUpdate(projectId, updated)}
                  onRemove={() => handleRemove(projectId)}
                />
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
