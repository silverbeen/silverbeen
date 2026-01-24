'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/components/ui';
import { portfolioApi } from '@/lib/api/portfolio';
import {
  ProfileSection,
  ClubSection,
  ProjectSection,
  AwardsSection,
  CertificationsSection,
  ActivitiesSection,
} from '@/components/portfolio';
import type { PortfolioData } from '@/types/portfolio';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="text-gray-500">에디터 로딩 중...</div>
    </div>
  ),
});

// Next.js Image wrapper
const NextImage = ({
  src,
  alt,
  fill,
  className,
  priority,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}) => (
  <Image
    src={src}
    alt={alt}
    fill={fill}
    className={className}
    priority={priority}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
);

export default function AdminPortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [jsonString, setJsonString] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const { toast } = useToast();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await portfolioApi.getPortfolio();
        setPortfolioData(data);
        setJsonString(JSON.stringify(data, null, 2));
      } catch {
        toast('포트폴리오 데이터를 불러오는데 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [toast]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value) return;
    setJsonString(value);

    try {
      const parsed = JSON.parse(value);
      setPortfolioData(parsed);
      setHasError(false);
      setErrorMessage('');
    } catch (e) {
      setHasError(true);
      setErrorMessage(e instanceof Error ? e.message : 'JSON 파싱 오류');
    }
  }, []);

  const handleSave = async () => {
    if (hasError) {
      toast('JSON 형식 오류를 먼저 수정해주세요.', 'error');
      return;
    }

    if (!portfolioData) return;

    setIsSaving(true);
    try {
      await portfolioApi.updatePortfolio(portfolioData);
      toast('포트폴리오가 저장되었습니다.', 'success');
    } catch {
      toast('저장에 실패했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonString(JSON.stringify(parsed, null, 2));
      setHasError(false);
      setErrorMessage('');
    } catch {
      toast('JSON 형식이 올바르지 않습니다.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10 shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← 뒤로
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              포트폴리오 편집
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                에디터
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                미리보기
              </button>
            </div>
            <button
              onClick={handleFormat}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              포맷팅
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || hasError}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">JSON 오류: {errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content - Split View */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor Panel */}
        <div
          className={`lg:w-1/2 h-[calc(100vh-120px)] lg:h-auto lg:flex-1 border-r border-gray-200 dark:border-gray-700 ${
            activeTab === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                JSON 에디터
              </span>
            </div>
            <div className="flex-1">
              <MonacoEditor
                height="100%"
                language="json"
                theme="vs-dark"
                value={jsonString}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div
          className={`lg:w-1/2 h-[calc(100vh-120px)] lg:h-auto lg:flex-1 overflow-auto bg-white dark:bg-gray-900 ${
            activeTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                미리보기
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              {portfolioData && !hasError ? (
                <div className="p-6">
                  <div className="max-w-3xl mx-auto flex flex-col gap-8">
                    <ProfileSection
                      profile={portfolioData.profile}
                      ImageComponent={NextImage}
                    />
                    <hr className="border-sky-100 dark:border-sky-900/30" />
                    <ProjectSection projects={portfolioData.projects} />
                    {portfolioData.awards && portfolioData.awards.length > 0 && (
                      <>
                        <hr className="border-sky-100 dark:border-sky-900/30" />
                        <AwardsSection awards={portfolioData.awards} />
                      </>
                    )}
                    <hr className="border-sky-100 dark:border-sky-900/30" />
                    <ClubSection clubs={portfolioData.clubs} />
                    {portfolioData.activities && portfolioData.activities.length > 0 && (
                      <>
                        <hr className="border-sky-100 dark:border-sky-900/30" />
                        <ActivitiesSection activities={portfolioData.activities} />
                      </>
                    )}
                    {portfolioData.certifications && portfolioData.certifications.length > 0 && (
                      <>
                        <hr className="border-sky-100 dark:border-sky-900/30" />
                        <CertificationsSection certifications={portfolioData.certifications} />
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  {hasError
                    ? 'JSON 오류를 수정하면 미리보기가 표시됩니다.'
                    : '데이터가 없습니다.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
