'use client';

import type { PortfolioProject, ProjectCategory } from '@/types/portfolio';
import { FormField, inputClassName, AutoTextarea } from '@/components/editor/FormField';
import { Calendar, FolderOpen, UserCircle } from 'lucide-react';

interface ProjectBasicInfoProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K]
  ) => void;
}

const categoryOptions: { value: ProjectCategory; label: string }[] = [
  { value: 'personal', label: '개인 프로젝트' },
  { value: 'team', label: '팀 프로젝트' },
  { value: 'club', label: '동아리 프로젝트' },
];

export function ProjectBasicInfo({ project, onChange }: ProjectBasicInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-primary-500" />
        프로젝트 정보
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="프로젝트명" required>
          <input
            type="text"
            value={project.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={inputClassName}
            placeholder="프로젝트명"
          />
        </FormField>

        <FormField label="카테고리" required>
          <select
            value={project.category}
            onChange={(e) =>
              onChange('category', e.target.value as ProjectCategory)
            }
            className={inputClassName}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="기간" required>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={project.period}
              onChange={(e) => onChange('period', e.target.value)}
              className={`${inputClassName} pl-10`}
              placeholder="2023.01 ~ 2023.06"
            />
          </div>
        </FormField>

        <FormField label="역할" required>
          <div className="relative">
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={project.role}
              onChange={(e) => onChange('role', e.target.value)}
              className={`${inputClassName} pl-10`}
              placeholder="프론트엔드 개발"
            />
          </div>
        </FormField>

        {project.category === 'club' && (
          <FormField label="동아리명">
            <input
              type="text"
              value={project.clubName || ''}
              onChange={(e) => onChange('clubName', e.target.value)}
              className={inputClassName}
              placeholder="동아리명"
            />
          </FormField>
        )}

        {project.category !== 'personal' && (
          <FormField label="팀 인원">
            <input
              type="number"
              value={project.teamSize || ''}
              onChange={(e) =>
                onChange('teamSize', parseInt(e.target.value) || undefined)
              }
              className={inputClassName}
              placeholder="4"
              min={1}
            />
          </FormField>
        )}
      </div>

      <div className="mt-4">
        <FormField label="설명" required>
          <AutoTextarea
            value={project.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="프로젝트에 대한 설명"
            minRows={3}
            maxRows={8}
          />
        </FormField>
      </div>
    </div>
  );
}
