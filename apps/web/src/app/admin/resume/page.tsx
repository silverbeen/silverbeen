'use client';

import { useCallback } from 'react';
import { resumeApi } from '@/lib/api/resume';
import { JsonEditorPage, NextImage } from '@/components/admin';
import { ResumeSections } from '@/components/resume';
import type { ResumeData } from '@/types/resume';

export default function AdminResumePage() {
  const fetchResume = useCallback(() => resumeApi.getResume(), []);
  const saveResume = useCallback(
    (data: ResumeData, token: string) => resumeApi.updateResume(data, token),
    []
  );

  const renderPreview = useCallback(
    (data: ResumeData) => (
      <ResumeSections data={data} ImageComponent={NextImage} />
    ),
    []
  );

  return (
    <JsonEditorPage<ResumeData>
      pageTitle="이력서 편집"
      fetchErrorMessage="이력서 데이터를 불러오는데 실패했습니다."
      saveSuccessMessage="이력서가 저장되었습니다."
      fetchData={fetchResume}
      saveData={saveResume}
      renderPreview={renderPreview}
    />
  );
}
