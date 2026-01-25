'use client';

import {
  ProfileSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  CertificationSection,
  AwardSection,
} from '@/components/resume';
import type { ResumeData } from '@/types/resume';

interface ResumeSectionsProps {
  data: ResumeData;
  ImageComponent: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
  }>;
}

export function ResumeSections({ data, ImageComponent }: ResumeSectionsProps) {
  return (
    <>
      <ProfileSection profile={data.profile} ImageComponent={ImageComponent} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <SkillsSection skills={data.skills} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <ExperienceSection experience={data.experience} ImageComponent={ImageComponent} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <EducationSection education={data.education} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <AwardSection awards={data.awards} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <CertificationSection certifications={data.certifications} />
    </>
  );
}
