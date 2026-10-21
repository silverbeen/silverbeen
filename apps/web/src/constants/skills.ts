import type { Skills } from '@silverbeen/types';

export type SkillCategory = keyof Skills;

/**
 * 기술 스택 카테고리 라벨 (이력서/포트폴리오 화면, PDF, 어드민 에디터 공통)
 */
export const SKILL_LABELS: Record<SkillCategory, string> = {
  languages: 'Core',
  stateManagement: '상태 관리',
  libraries: '모노레포 & 라이브러리',
  tools: '개발 도구 & CI/CD',
  collaboration: '협업',
  integrations: '연동',
  infrastructure: '인프라',
  testing: '테스트',
};

/** 기술 스택 카테고리 표시 순서 */
export const SKILL_ORDER: readonly SkillCategory[] = [
  'languages',
  'stateManagement',
  'libraries',
  'tools',
  'collaboration',
  'integrations',
  'infrastructure',
  'testing',
];
