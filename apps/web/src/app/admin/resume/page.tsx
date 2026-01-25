'use client';

import { useCallback } from 'react';
import { resumeApi } from '@/lib/api/resume';
import { JsonEditorPage, NextImage } from '@/components/admin';
import {
  ProfileSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  CertificationSection,
  AwardSection,
} from '@/components/resume';
import type { ResumeData } from '@/types/resume';

export default function AdminResumePage() {
  const fetchResume = useCallback(() => resumeApi.getResume(), []);
  const saveResume = useCallback(
    (data: ResumeData) => resumeApi.updateResume(data),
    []
  );

  const renderPreview = useCallback(
    (data: ResumeData) => (
      <>
        <ProfileSection profile={data.profile} ImageComponent={NextImage} />
        <hr className="border-sky-100 dark:border-sky-900/30" />
        <SkillsSection skills={data.skills} />
        <hr className="border-sky-100 dark:border-sky-900/30" />
        <ExperienceSection experience={data.experience} ImageComponent={NextImage} />
        <hr className="border-sky-100 dark:border-sky-900/30" />
        <EducationSection education={data.education} />
        <hr className="border-sky-100 dark:border-sky-900/30" />
        <AwardSection awards={data.awards} />
        <hr className="border-sky-100 dark:border-sky-900/30" />
        <CertificationSection certifications={data.certifications} />
      </>
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
