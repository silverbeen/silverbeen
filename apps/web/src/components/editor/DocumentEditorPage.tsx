'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { JsonEditorPage } from '@/components/admin/JsonEditorPage';
import { useToast } from '@/components/ui';
import type { EditorMode } from './SectionedFormEditor';

export interface DocumentFormProps<T> {
  initialData: T;
  onSave: (data: T) => Promise<void>;
  onBack: () => void;
  saving: boolean;
  editorMode: EditorMode;
  onModeChange: (mode: EditorMode, currentData: T) => void;
}

interface DocumentEditorPageProps<T> {
  /** 문서 이름 (예: '이력서') - 메시지/제목에 사용 */
  documentName: string;
  load: () => Promise<T>;
  save: (data: T) => Promise<unknown>;
  renderForm: (props: DocumentFormProps<T>) => ReactNode;
  renderPreview: (data: T) => ReactNode;
}

/**
 * 어드민 문서(이력서/포트폴리오) 편집 페이지. 폼 모드 ↔ JSON 모드 전환 시
 * 편집 중인 데이터를 그대로 넘겨 저장하지 않은 변경 사항이 유지된다
 */
export function DocumentEditorPage<T>({
  documentName,
  load,
  save,
  renderForm,
  renderPreview,
}: DocumentEditorPageProps<T>) {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<EditorMode>('form');
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchErrorMessage = `${documentName} 데이터를 불러오는데 실패했습니다.`;
  const saveSuccessMessage = `${documentName}가 저장되었습니다.`;

  useEffect(() => {
    let ignore = false;
    load()
      .then((loaded) => {
        if (!ignore) setData(loaded);
      })
      .catch(() => {
        if (!ignore) setError(fetchErrorMessage);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [load, fetchErrorMessage]);

  const handleFormSave = async (formData: T) => {
    setSaving(true);
    try {
      await save(formData);
      setData(formData);
      toast(saveSuccessMessage, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : '저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="text-primary-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-500">{error || '데이터를 불러올 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {mode === 'json' ? (
        <JsonEditorPage<T>
          pageTitle={`${documentName} 편집`}
          saveSuccessMessage={saveSuccessMessage}
          initialData={data}
          saveData={save}
          renderPreview={renderPreview}
          onModeChange={(latestData) => {
            setData(latestData);
            setMode('form');
          }}
        />
      ) : (
        renderForm({
          initialData: data,
          onSave: handleFormSave,
          onBack: () => router.push('/admin'),
          saving,
          editorMode: mode,
          onModeChange: (nextMode, currentData) => {
            setData(currentData);
            setMode(nextMode);
          },
        })
      )}
    </div>
  );
}
