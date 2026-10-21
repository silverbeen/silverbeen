import type { ProjectCategory } from '@silverbeen/types';

/**
 * 포트폴리오 프로젝트 카테고리 라벨 (화면, PDF, 어드민 에디터 공통)
 */
export const PROJECT_CATEGORY_LABELS: Record<
  ProjectCategory,
  { label: string; shortLabel: string }
> = {
  personal: { label: '개인 프로젝트', shortLabel: '개인' },
  team: { label: '팀 프로젝트', shortLabel: '팀' },
  club: { label: '동아리 프로젝트', shortLabel: '동아리' },
};

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = ['personal', 'team', 'club'];
