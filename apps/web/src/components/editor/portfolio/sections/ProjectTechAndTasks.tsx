'use client';

import type { PortfolioProject } from '@/types/portfolio';
import { StringArrayField } from '@/components/editor/ArrayField';

interface ProjectTechAndTasksProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K]
  ) => void;
}

export function ProjectTechAndTasks({
  project,
  onChange,
}: ProjectTechAndTasksProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-4">
      <StringArrayField
        label="기술 스택"
        items={project.techStack}
        onChange={(items) => onChange('techStack', items)}
        placeholder="React, TypeScript 등"
        addLabel="기술 추가"
      />

      <StringArrayField
        label="주요 작업"
        items={project.tasks}
        onChange={(items) => onChange('tasks', items)}
        placeholder="작업 내용 입력"
        addLabel="작업 추가"
      />

      <StringArrayField
        label="성과"
        items={project.impact || []}
        onChange={(items) => onChange('impact', items)}
        placeholder="성과 입력"
        addLabel="성과 추가"
      />
    </div>
  );
}
