'use client';

import {
  ProfileSection,
  ClubSection,
  ProjectSection,
  AwardsSection,
  CertificationsSection,
  ActivitiesSection,
  SkillsSection,
  EducationSection,
} from '@/components/portfolio';
import type { PortfolioData } from '@/types/portfolio';

interface PortfolioSectionsProps {
  data: PortfolioData;
  ImageComponent: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
  }>;
}

export function PortfolioSections({ data, ImageComponent }: PortfolioSectionsProps) {
  return (
    <>
      <ProfileSection profile={data.profile} ImageComponent={ImageComponent} />

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
