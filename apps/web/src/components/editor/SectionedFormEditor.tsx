'use client';

import { useCallback, useState, type ReactNode } from 'react';
import type { z } from 'zod';
import { Loader2, Check, ArrowLeft, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui';
import { assignIds, stripIds } from '@/utils/ids';

export type EditorMode = 'form' | 'json';

export type SectionUpdater<T> = <K extends keyof T>(key: K, value: T[K]) => void;

export interface FormSection<T> {
  key: string;
  label: string;
  icon: ReactNode;
  render: (args: {
    data: T;
    update: SectionUpdater<T>;
    errors: Record<string, string>;
  }) => ReactNode;
}

export interface SectionedFormEditorProps<T> {
  /** 초기 데이터. 마운트 시 한 번만 읽음 (다시 초기화하려면 부모에서 key 변경) */
  initialData: T;
  /** 저장 전 검증 스키마 */
  schema: z.ZodType<T>;
  sections: readonly FormSection<T>[];
  onSave: (data: T) => Promise<void>;
  onBack?: () => void;
  saving?: boolean;
  title: string;
  // 편집 모드 전환 관련
  editorMode?: EditorMode;
  /** 모드 전환 요청. 현재 편집 중인 데이터(`_id` 제거)를 함께 전달 */
  onModeChange?: (mode: EditorMode, currentData: T) => void;
}

/**
 * 섹션 네비게이션(사이드바/모바일 탭) + 이전/저장/다음 헤더를 갖춘 공통 폼 에디터.
 * 리스트 항목의 안정적인 key를 위해 초기화 시 `_id`를 부여하고 저장 시 제거한다 (utils/ids)
 */
export function SectionedFormEditor<T>({
  initialData,
  schema,
  sections,
  onSave,
  onBack,
  saving,
  title,
  editorMode = 'form',
  onModeChange,
}: SectionedFormEditorProps<T>) {
  const [formData, setFormData] = useState<T>(() => assignIds(initialData));
  const [activeSection, setActiveSection] = useState(sections[0]?.key);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSave = async () => {
    // Zod 검증 (클라이언트 전용 `_id`는 제거 후 검증/저장)
    const result = schema.safeParse(stripIds(formData));
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
      await onSave(result.data);
    } catch {
      toast('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const updateSection = useCallback<SectionUpdater<T>>((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleModeChange = (mode: EditorMode) => {
    onModeChange?.(mode, stripIds(formData));
  };

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
    <div className="flex h-full min-h-[700px] flex-col bg-gray-50 dark:bg-gray-900">
      {/* 통합 상단 헤더 */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          {/* 모바일: 2행 레이아웃, 데스크탑: 1행 레이아웃 */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            {/* 좌측: 뒤로가기 + 타이틀 */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 lg:justify-start">
              <div className="flex items-center gap-2 sm:gap-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:gap-1.5 sm:px-2.5 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">뒤로</span>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div className="bg-primary-100 dark:bg-primary-900/30 rounded-lg p-1 sm:p-1.5">
                    <FileText className="text-primary-600 dark:text-primary-400 h-4 w-4" />
                  </div>
                  <h1 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                    {title}
                  </h1>
                </div>
              </div>

              {/* 모바일에서 편집 모드 전환 */}
              {onModeChange && (
                <div className="flex rounded-lg bg-gray-100 p-0.5 lg:hidden dark:bg-gray-700">
                  <button
                    onClick={() => handleModeChange('form')}
                    className={`rounded-md px-2 py-1 text-xs transition-colors ${
                      editorMode === 'form'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    폼
                  </button>
                  <button
                    onClick={() => handleModeChange('json')}
                    className={`rounded-md px-2 py-1 text-xs transition-colors ${
                      editorMode === 'json'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
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
                className="flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 sm:gap-1 sm:px-3 sm:text-sm dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="xs:inline hidden">이전</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors disabled:opacity-50 sm:gap-1.5 sm:px-4 sm:text-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span className="xs:inline hidden">{saving ? '저장 중...' : '저장하기'}</span>
                <span className="xs:hidden">{saving ? '저장...' : '저장'}</span>
              </button>

              <button
                onClick={goToNext}
                disabled={currentIndex === sections.length - 1}
                className="flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 sm:gap-1 sm:px-3 sm:text-sm dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span className="xs:inline hidden">다음</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 우측: 편집 모드 전환 (데스크탑만) */}
            {onModeChange && (
              <div className="hidden items-center gap-2 lg:flex">
                <span className="text-xs text-gray-500 dark:text-gray-400">편집 모드:</span>
                <div className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-700">
                  <button
                    onClick={() => handleModeChange('form')}
                    className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                      editorMode === 'form'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    폼
                  </button>
                  <button
                    onClick={() => handleModeChange('json')}
                    className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                      editorMode === 'json'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
        <div className="overflow-x-auto border-t border-gray-100 lg:hidden dark:border-gray-700/50">
          <div className="flex min-w-max gap-1 px-2 py-2">
            {sections.map(({ key, label, icon }, index) => {
              const isActive = activeSection === key;
              const isPast = index < currentIndex;

              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-sm'
                      : isPast
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  } `}
                >
                  {isPast && !isActive ? <Check className="h-3 w-3" /> : icon}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 사이드바 - 섹션 네비게이션 (데스크탑만) */}
        <div className="hidden w-56 shrink-0 border-r border-gray-200 bg-white lg:block dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              섹션
            </h2>
          </div>
          <nav className="space-y-1 p-3">
            {sections.map(({ key, label, icon }, index) => {
              const isActive = activeSection === key;
              const isPast = index < currentIndex;

              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 shadow-primary-500/25 text-white shadow-md'
                      : isPast
                        ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  } `}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20'
                        : isPast
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'bg-gray-100 dark:bg-gray-700'
                    } `}
                  >
                    {isPast && !isActive ? <Check className="h-4 w-4" /> : icon}
                  </span>
                  <span className={isActive ? 'font-medium' : ''}>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* 진행률 표시 */}
          <div className="mx-4 mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>진행률</span>
              <span>{Math.round(((currentIndex + 1) / sections.length) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
              <div
                className="from-primary-500 to-primary-400 h-full bg-gradient-to-r transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / sections.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {sections
              .find(({ key }) => key === activeSection)
              ?.render({ data: formData, update: updateSection, errors })}
          </div>
        </div>
      </div>
    </div>
  );
}
