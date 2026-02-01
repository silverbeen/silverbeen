'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { portfolioApi } from '@/lib/api/portfolio';
import { JsonEditorPage, NextImage } from '@/components/admin';
import { PortfolioSections } from '@/components/portfolio';
import { PortfolioFormEditor } from '@/components/editor/portfolio';
import { useToast } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import type { PortfolioData } from '@/types/portfolio';
import { Loader2 } from 'lucide-react';

type EditorMode = 'form' | 'json';

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [mode, setMode] = useState<EditorMode>('form');
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const portfolioData = await portfolioApi.getPortfolio();
        setData(portfolioData);
      } catch {
        setError('포트폴리오 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // JSON 모드용 콜백
  const fetchPortfolio = useCallback(() => portfolioApi.getPortfolio(), []);
  const savePortfolio = useCallback(
    (portfolioData: PortfolioData, token: string) =>
      portfolioApi.updatePortfolio(portfolioData, token),
    []
  );
  const renderPreview = useCallback(
    (portfolioData: PortfolioData) => (
      <PortfolioSections data={portfolioData} ImageComponent={NextImage} />
    ),
    []
  );

  // 폼 모드 저장
  const handleFormSave = async (portfolioData: PortfolioData) => {
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast('로그인이 필요합니다.', 'error');
        return;
      }
      await portfolioApi.updatePortfolio(portfolioData, session.access_token);
      setData(portfolioData);
      toast('포트폴리오가 저장되었습니다.', 'success');
    } catch {
      toast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-500">{error || '데이터를 불러올 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {mode === 'json' ? (
        <JsonEditorPage<PortfolioData>
          pageTitle="포트폴리오 편집"
          fetchErrorMessage="포트폴리오 데이터를 불러오는데 실패했습니다."
          saveSuccessMessage="포트폴리오가 저장되었습니다."
          fetchData={fetchPortfolio}
          saveData={savePortfolio}
          renderPreview={renderPreview}
          onModeChange={(latestData) => {
            setData(latestData);
            setMode('form');
          }}
        />
      ) : (
        <PortfolioFormEditor
          initialData={data}
          onSave={handleFormSave}
          onBack={handleBack}
          saving={saving}
          editorMode={mode}
          onModeChange={setMode}
        />
      )}
    </div>
  );
}
