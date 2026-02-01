'use client';

import type { Skills } from '@/types/resume';
import { StringArrayField } from '../ArrayField';
import {
  Code2,
  Database,
  Library,
  Wrench,
  Users,
  Link,
  Server,
  TestTube,
} from 'lucide-react';

interface SkillsEditorProps {
  data: Skills;
  onChange: (data: Skills) => void;
}

const skillCategories: {
  key: keyof Skills;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    key: 'languages',
    label: '언어',
    icon: <Code2 className="h-5 w-5" />,
    description: 'TypeScript, JavaScript, Python 등',
  },
  {
    key: 'stateManagement',
    label: '상태관리',
    icon: <Database className="h-5 w-5" />,
    description: 'Redux, Zustand, Recoil 등',
  },
  {
    key: 'libraries',
    label: '라이브러리',
    icon: <Library className="h-5 w-5" />,
    description: 'React, Next.js, TailwindCSS 등',
  },
  {
    key: 'tools',
    label: '도구',
    icon: <Wrench className="h-5 w-5" />,
    description: 'VS Code, Git, npm/pnpm 등',
  },
  {
    key: 'collaboration',
    label: '협업',
    icon: <Users className="h-5 w-5" />,
    description: 'Slack, Notion, Jira 등',
  },
  {
    key: 'integrations',
    label: '연동',
    icon: <Link className="h-5 w-5" />,
    description: 'REST API, GraphQL, Firebase 등',
  },
  {
    key: 'infrastructure',
    label: '인프라',
    icon: <Server className="h-5 w-5" />,
    description: 'AWS, Docker, Vercel 등',
  },
  {
    key: 'testing',
    label: '테스트',
    icon: <TestTube className="h-5 w-5" />,
    description: 'Jest, Cypress, Playwright 등',
  },
];

export function SkillsEditor({ data, onChange }: SkillsEditorProps) {
  const handleChange = (key: keyof Skills, items: string[]) => {
    onChange({ ...data, [key]: items });
  };

  const filledCount = skillCategories.filter(
    ({ key }) => data[key] && data[key].length > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            기술 스택
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            보유한 기술을 카테고리별로 추가해주세요
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {filledCount}/{skillCategories.length} 카테고리 작성
          </span>
        </div>
      </div>

      {/* 스킬 카테고리 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {skillCategories.map(({ key, label, icon, description }) => {
          const skills = data[key] || [];
          const isEmpty = skills.length === 0;

          return (
            <div
              key={key}
              className={`
                p-5 rounded-xl border-2 transition-all duration-200
                ${
                  isEmpty
                    ? 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'
                    : 'border-solid border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 shadow-sm'
                }
              `}
            >
              {/* 카테고리 헤더 */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`
                    p-2.5 rounded-lg shrink-0
                    ${
                      isEmpty
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    }
                  `}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {label}
                    </h4>
                    {!isEmpty && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                        {skills.length}개
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {description}
                  </p>
                </div>
              </div>

              {/* 스킬 입력 필드 */}
              <StringArrayField
                label=""
                items={skills}
                onChange={(items) => handleChange(key, items)}
                placeholder={`${label} 추가`}
                addLabel="추가"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
