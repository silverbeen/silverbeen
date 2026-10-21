'use client';

import type { PortfolioProject } from '@silverbeen/types';
import { SortableImageList } from '../../SortableImageList';

interface ProjectImagesSectionProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(key: K, value: PortfolioProject[K]) => void;
}

export function ProjectImagesSection({ project, onChange }: ProjectImagesSectionProps) {
  return (
    <SortableImageList
      images={project.images ?? []}
      onChange={(images) => onChange('images', images)}
      folder="portfolio"
      uploadTitle="포트폴리오 이미지 업로드"
      previewLabel={project.name || '프로젝트'}
      className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
    />
  );
}
