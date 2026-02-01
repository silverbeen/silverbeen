'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PortfolioData } from '@/types/portfolio';
import { portfolioSchema } from '@/schemas/portfolio';
import { ProfileEditor } from '../resume/ProfileEditor';
import { SkillsEditor } from '../resume/SkillsEditor';
import { EducationEditor } from '../resume/EducationEditor';
import { ClubEditor } from './ClubEditor';
import { ProjectEditor } from './ProjectEditor';
import { useToast } from '@/components/ui';
import {
  Loader2,
  User,
  Code2,
  GraduationCap,
  Users,
  FolderOpen,
  Check,
  ArrowLeft,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PortfolioFormEditorProps {
  initialData: PortfolioData;
  onSave: (data: PortfolioData) => Promise<void>;
  onBack?: () => void;
  saving?: boolean;
  title?: string;
  // 편집 모드 전환 관련
  editorMode?: 'form' | 'json';
  onModeChange?: (mode: 'form' | 'json') => void;
}

type SectionKey = 'profile' | 'skills' | 'education' | 'clubs' | 'projects';

const sections: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: '기본 정보', icon: <User className="h-4 w-4" /> },
  { key: 'skills', label: '기술 스택', icon: <Code2 className="h-4 w-4" /> },
  {
    key: 'education',
    label: '학력',
    icon: <GraduationCap className="h-4 w-4" />,
  },
  { key: 'clubs', label: '동아리', icon: <Users className="h-4 w-4" /> },
  {
    key: 'projects',
    label: '프로젝트',
    icon: <FolderOpen className="h-4 w-4" />,
  },
];

export function PortfolioFormEditor({
  initialData,
  onSave,
  onBack,
  saving,
  title = '포트폴리오 편집',
  editorMode = 'form',
  onModeChange,
}: PortfolioFormEditorProps) {
  const [formData, setFormData] = useState<PortfolioData>(initialData);
  const [activeSection, setActiveSection] = useState<SectionKey>('profile');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // initialData가 변경되면 formData 업데이트 및 에러 초기화
  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  const handleSave = async () => {
    // Zod 검증
    const result = portfolioSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path.join('.')] = err.message;
      });
      setErrors(fieldErrors);
      toast('입력값을 확인해주세요.', 'warning');
      return;
    }

    setErrors({});
    try {
      await onSave(result.data as PortfolioData);
    } catch {
      toast('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const updateSection = useCallback(
    <K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const currentIndex = sections.findIndex((s) => s.key === activeSection);

  const goToPrev = () => {
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].key);
    }
  };

  const goToNext = () => {
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].key);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[700px] bg-gray-50 dark:bg-gray-900">
      {/* 통합 상단 헤더 */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          {/* 모바일: 2행 레이아웃, 데스크탑: 1행 레이아웃 */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            {/* 좌측: 뒤로가기 + 타이틀 */}
            <div className="flex items-center justify-between lg:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">뒤로</span>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div className="p-1 sm:p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h1>
                </div>
              </div>

              {/* 모바일에서 편집 모드 전환 */}
              {onModeChange && (
                <div className="flex lg:hidden bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => onModeChange('form')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      editorMode === 'form'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    폼
                  </button>
                  <button
                    onClick={() => onModeChange('json')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      editorMode === 'json'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              )}
            </div>

            {/* 중앙: 이전/저장/다음 네비게이션 */}
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <button
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden xs:inline">이전</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 bg-primary-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span className="hidden xs:inline">{saving ? '저장 중...' : '저장하기'}</span>
                <span className="xs:hidden">{saving ? '저장...' : '저장'}</span>
              </button>

              <button
                onClick={goToNext}
                disabled={currentIndex === sections.length - 1}
                className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden xs:inline">다음</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 우측: 편집 모드 전환 (데스크탑만) */}
            {onModeChange && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  편집 모드:
                </span>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => onModeChange('form')}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                      editorMode === 'form'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    폼
                  </button>
                  <button
                    onClick={() => onModeChange('json')}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                      editorMode === 'json'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 모바일 섹션 네비게이션 (가로 스크롤) */}
        <div className="lg:hidden overflow-x-auto border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex px-2 py-2 gap-1 min-w-max">
            {sections.map(({ key, label, icon }, index) => {
              const isActive = activeSection === key;
              const isPast = index < currentIndex;

              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all
                    ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-sm'
                        : isPast
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {isPast && !isActive ? <Check className="h-3 w-3" /> : icon}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* 사이드바 - 섹션 네비게이션 (데스크탑만) */}
        <div className="hidden lg:block w-56 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              섹션
            </h2>
          </div>
          <nav className="p-3 space-y-1">
            {sections.map(({ key, label, icon }, index) => {
              const isActive = activeSection === key;
              const isPast = index < currentIndex;

              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                        : isPast
                          ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-lg transition-colors
                      ${
                        isActive
                          ? 'bg-white/20'
                          : isPast
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'bg-gray-100 dark:bg-gray-700'
                      }
                    `}
                  >
                    {isPast && !isActive ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      icon
                    )}
                  </span>
                  <span className={isActive ? 'font-medium' : ''}>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* 진행률 표시 */}
          <div className="mx-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>진행률</span>
              <span>
                {Math.round(((currentIndex + 1) / sections.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / sections.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {activeSection === 'profile' && (
              <ProfileEditor
                data={formData.profile}
                onChange={(value) => updateSection('profile', value)}
                errors={errors}
              />
            )}
            {activeSection === 'skills' && (
              <SkillsEditor
                data={formData.skills || {
                  languages: [],
                  stateManagement: [],
                  libraries: [],
                  tools: [],
                  collaboration: [],
                  integrations: [],
                }}
                onChange={(value) => updateSection('skills', value)}
              />
            )}
            {activeSection === 'education' && (
              <EducationEditor
                data={formData.education || []}
                onChange={(value) => updateSection('education', value)}
              />
            )}
            {activeSection === 'clubs' && (
              <ClubEditor
                data={formData.clubs}
                onChange={(value) => updateSection('clubs', value)}
              />
            )}
            {activeSection === 'projects' && (
              <ProjectEditor
                data={formData.projects}
                onChange={(value) => updateSection('projects', value)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
