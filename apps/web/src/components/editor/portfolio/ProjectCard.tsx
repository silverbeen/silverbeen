'use client';

import type { PortfolioProject, ProjectCategory } from '@/types/portfolio';
import {
  ProjectBasicInfo,
  ProjectTechAndTasks,
  ProjectGrowthSection,
  ProjectLinksSection,
  ProjectImagesSection,
  ProjectDisplayOptions,
} from './sections';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  FolderOpen,
  Calendar,
} from 'lucide-react';

interface ProjectCardProps {
  project: PortfolioProject;
  expanded: boolean;
  onToggle: () => void;
  onChange: (project: PortfolioProject) => void;
  onRemove: () => void;
}

const categoryOptions: { value: ProjectCategory; label: string }[] = [
  { value: 'personal', label: '개인 프로젝트' },
  { value: 'team', label: '팀 프로젝트' },
  { value: 'club', label: '동아리 프로젝트' },
];

export function ProjectCard({
  project,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: ProjectCardProps) {
  const handleChange = <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K]
  ) => {
    onChange({ ...project, [key]: value });
  };

  const taskCount = project.tasks.length;
  const imageCount = project.images?.length || 0;
  const linkCount = project.links?.length || 0;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <FolderOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                {project.name || '새 프로젝트'}
              </h4>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full">
                {
                  categoryOptions.find((c) => c.value === project.category)
                    ?.label
                }
              </span>
              {project.hidden && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                  숨김
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{project.period || '기간 미입력'}</span>
              </div>
              {(taskCount > 0 || imageCount > 0 || linkCount > 0) && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  {taskCount > 0 && (
                    <span className="text-xs text-gray-400">
                      작업 {taskCount}개
                    </span>
                  )}
                  {linkCount > 0 && (
                    <span className="text-xs text-gray-400">
                      링크 {linkCount}개
                    </span>
                  )}
                  {imageCount > 0 && (
                    <span className="text-xs text-gray-400">
                      이미지 {imageCount}개
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div
            className={`p-2 rounded-lg transition-colors ${
              expanded
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-400'
            }`}
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      {expanded && (
        <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <ProjectBasicInfo project={project} onChange={handleChange} />
          <ProjectTechAndTasks project={project} onChange={handleChange} />
          <ProjectGrowthSection project={project} onChange={handleChange} />
          <ProjectLinksSection project={project} onChange={handleChange} />
          <ProjectImagesSection project={project} onChange={handleChange} />
          <ProjectDisplayOptions project={project} onChange={handleChange} />
        </div>
      )}
    </div>
  );
}
