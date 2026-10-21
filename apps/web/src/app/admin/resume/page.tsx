'use client';

import type { ResumeData } from '@silverbeen/types';
import { resumeApi } from '@/lib/api/resume';
import { DocumentEditorPage } from '@/components/editor/DocumentEditorPage';
import { ResumeFormEditor } from '@/components/editor/resume';
import { ResumeSections } from '@/components/resume';

const loadResume = () => resumeApi.getResume();

export default function AdminResumePage() {
  return (
    <DocumentEditorPage<ResumeData>
      documentName="이력서"
      load={loadResume}
      save={resumeApi.updateResume}
      renderForm={(props) => <ResumeFormEditor {...props} />}
      renderPreview={(data) => <ResumeSections data={data} />}
    />
  );
}
