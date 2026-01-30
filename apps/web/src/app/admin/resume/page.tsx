'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { resumeApi } from '@/lib/api/resume';
import { JsonEditorPage, NextImage } from '@/components/admin';
import { ResumeSections } from '@/components/resume';
import { ResumeFormEditor } from '@/components/editor/resume';
import { useToast } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import type { ResumeData } from '@/types/resume';
import { Loader2 } from 'lucide-react';

type EditorMode = 'form' | 'json';

export default function AdminResumePage() {
  const router = useRouter();
  const [mode, setMode] = useState<EditorMode>('form');
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumeData = await resumeApi.getResume();
        setData(resumeData);
      } catch {
        setError('이력서 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // JSON 모드용 콜백
  const fetchResume = useCallback(() => resumeApi.getResume(), []);
  const saveResume = useCallback(
    (resumeData: ResumeData, token: string) =>
      resumeApi.updateResume(resumeData, token),
    []
  );
  const renderPreview = useCallback(
    (resumeData: ResumeData) => (
      <ResumeSections data={resumeData} ImageComponent={NextImage} />
    ),
    []
  );

  // 폼 모드 저장
  const handleFormSave = async (resumeData: ResumeData) => {
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast('로그인이 필요합니다.', 'error');
        return;
      }
      await resumeApi.updateResume(resumeData, session.access_token);
      setData(resumeData);
      toast('이력서가 저장되었습니다.', 'success');
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
        <JsonEditorPage<ResumeData>
          pageTitle="이력서 편집"
          fetchErrorMessage="이력서 데이터를 불러오는데 실패했습니다."
          saveSuccessMessage="이력서가 저장되었습니다."
          fetchData={fetchResume}
          saveData={saveResume}
          renderPreview={renderPreview}
        />
      ) : (
        <ResumeFormEditor
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
