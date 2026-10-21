import { ProfileSection } from './ProfileSection';
import { SkillsSection } from './SkillsSection';
import { CareerSummarySection } from './CareerSummarySection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { CertificationSection } from './CertificationSection';
import { AwardSection } from './AwardSection';
import type { ResumeData } from '@silverbeen/types';

interface ResumeSectionsProps {
  data: ResumeData;
}

export function ResumeSections({ data }: ResumeSectionsProps) {
  return (
    <>
      <ProfileSection profile={data.profile} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <SkillsSection skills={data.skills} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      {data.careerSummary && data.careerSummary.length > 0 && (
        <>
          <CareerSummarySection careerSummary={data.careerSummary} />
          <hr className="border-sky-100 dark:border-sky-900/30" />
        </>
      )}

      <ExperienceSection experience={data.experience} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <EducationSection education={data.education} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <AwardSection awards={data.awards} />

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <CertificationSection certifications={data.certifications} />
    </>
  );
}
