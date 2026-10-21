import { ProfileSection } from './ProfileSection';
import { ClubSection } from './ClubSection';
import { ProjectSection } from './ProjectSection';
import { AwardsSection } from './AwardsSection';
import { CertificationsSection } from './CertificationsSection';
import { ActivitiesSection } from './ActivitiesSection';
import { SkillsSection } from './SkillsSection';
import { EducationSection } from './EducationSection';
import type { PortfolioData } from '@silverbeen/types';

interface PortfolioSectionsProps {
  data: PortfolioData;
}

export function PortfolioSections({ data }: PortfolioSectionsProps) {
  return (
    <>
      <ProfileSection profile={data.profile} />

      {data.skills && (
        <>
          <hr className="border-sky-100 dark:border-sky-900/30" />
          <SkillsSection skills={data.skills} />
        </>
      )}

      <hr className="border-sky-100 dark:border-sky-900/30" />

      <ProjectSection projects={data.projects} />

      {data.awards && data.awards.length > 0 && (
        <>
          <hr className="border-sky-100 dark:border-sky-900/30" />
          <AwardsSection awards={data.awards} />
        </>
      )}

      {data.clubs && data.clubs.length > 0 && (
        <>
          <hr className="border-sky-100 dark:border-sky-900/30" />
          <ClubSection clubs={data.clubs} />
        </>
      )}

      {data.activities && data.activities.length > 0 && (
        <>
          <hr className="border-sky-100 dark:border-sky-900/30" />
          <ActivitiesSection activities={data.activities} />
        </>
      )}

      {data.education && data.education.length > 0 && (
        <>
          <hr className="border-sky-100 dark:border-sky-900/30" />
          <EducationSection education={data.education} />
        </>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <>
          <hr className="border-sky-100 dark:border-sky-900/30" />
          <CertificationsSection certifications={data.certifications} />
        </>
      )}
    </>
  );
}
