'use client';

import type { PortfolioProject } from '@/types/portfolio';

interface ProjectDisplayOptionsProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K]
  ) => void;
}

export function ProjectDisplayOptions({
  project,
  onChange,
}: ProjectDisplayOptionsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        표시 옵션
      </h5>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={project.hidden || false}
            onChange={(e) => onChange('hidden', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            숨기기
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={project.pdfHidden || false}
            onChange={(e) => onChange('pdfHidden', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            PDF에서 숨기기
          </span>
        </label>
      </div>
    </div>
  );
}
