'use client';

import type { Experience, Project } from '@silverbeen/types';
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import { FormField, inputClassName, AutoTextarea } from '../../FormField';
import { ExperienceProjectCard } from './ExperienceProjectCard';
import { getItemId, withId } from '@/utils/ids';

interface ExperienceCardProps {
  experience: Experience;
  expanded: boolean;
  onToggle: () => void;
  onChange: (experience: Experience) => void;
  onRemove: () => void;
}

export function ExperienceCard({
  experience,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: ExperienceCardProps) {
  const handleChange = <K extends keyof Experience>(key: K, value: Experience[K]) => {
    onChange({ ...experience, [key]: value });
  };

  const handleAddProject = () => {
    const newProject = withId<Project>({ name: '', description: '', role: '', tasks: [] });
    handleChange('projects', [...experience.projects, newProject]);
  };

  const handleUpdateProject = (id: string, project: Project) => {
    handleChange(
      'projects',
      experience.projects.map((p) => (getItemId(p) === id ? project : p)),
    );
  };

  const handleRemoveProject = (id: string) => {
    handleChange(
      'projects',
      experience.projects.filter((p) => getItemId(p) !== id),
    );
  };

  const projectCount = experience.projects.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition-shadow hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* 헤더 */}
      <div
        className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={onToggle}
      >
        <div className="flex flex-1 items-center gap-4">
          <div className="bg-primary-100 dark:bg-primary-900/30 rounded-xl p-3">
            <Building2 className="text-primary-600 dark:text-primary-400 h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {experience.company || '새 경력'}
            </h4>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {experience.startDate || '시작일'}
                  {experience.endDate ? ` ~ ${experience.endDate}` : ' ~ 현재'}
                </span>
              </div>
              {experience.position && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {experience.position}
                  </span>
                </>
              )}
            </div>
          </div>
          {projectCount > 0 && (
            <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full px-3 py-1 text-xs font-medium">
              프로젝트 {projectCount}개
            </span>
          )}
        </div>
        <div className="ml-4 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div
            className={`rounded-lg p-2 transition-colors ${
              expanded
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-400'
            }`}
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      {expanded && (
        <div className="space-y-6 border-t border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          {/* 기본 정보 섹션 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h5 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Building2 className="text-primary-500 h-4 w-4" />
              회사 정보
            </h5>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="회사명" required>
                <input
                  type="text"
                  value={experience.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className={inputClassName}
                  placeholder="회사명"
                />
              </FormField>

              <FormField label="직책">
                <input
                  type="text"
                  value={experience.position || ''}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className={inputClassName}
                  placeholder="프론트엔드 개발자"
                />
              </FormField>

              <FormField label="시작일" required>
                <input
                  type="text"
                  value={experience.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={inputClassName}
                  placeholder="2023.01"
                />
              </FormField>

              <FormField label="종료일">
                <input
                  type="text"
                  value={experience.endDate || ''}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={inputClassName}
                  placeholder="2024.01 (비우면 '현재')"
                />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="설명">
                <AutoTextarea
                  value={experience.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="회사 또는 직무에 대한 간단한 설명"
                  minRows={2}
                  maxRows={6}
                />
              </FormField>
            </div>
          </div>

          {/* 프로젝트 섹션 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FolderOpen className="text-primary-500 h-4 w-4" />
                프로젝트
              </h5>
              <button
                type="button"
                onClick={handleAddProject}
                className="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                프로젝트 추가
              </button>
            </div>

            {experience.projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-10 dark:border-gray-700 dark:bg-gray-800/50">
                <FolderOpen className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">프로젝트를 추가해주세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {experience.projects.map((project) => {
                  const projectId = getItemId(project);
                  return (
                    <ExperienceProjectCard
                      key={projectId}
                      project={project}
                      onChange={(p) => handleUpdateProject(projectId, p)}
                      onRemove={() => handleRemoveProject(projectId)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
