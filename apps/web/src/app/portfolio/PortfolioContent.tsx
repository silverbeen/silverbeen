'use client';

import Image from 'next/image';
import {
  ProfileSection,
  ClubSection,
  ProjectSection,
  AwardsSection,
  CertificationsSection,
  ActivitiesSection,
} from '@/components/portfolio';
import { ScrollToTopButton } from '@/components/post/ScrollToTopButton';
import type { PortfolioData } from '@/types/portfolio';

const NextImage = ({
  src,
  alt,
  fill,
  className,
  priority,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}) => (
  <Image
    src={src}
    alt={alt}
    fill={fill}
    className={className}
    priority={priority}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
);

interface PortfolioContentProps {
  data: PortfolioData;
}

export function PortfolioContent({ data }: PortfolioContentProps) {
  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-col gap-12">
          <ProfileSection profile={data.profile} ImageComponent={NextImage} />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <ProjectSection projects={data.projects} />

          {data.awards && data.awards.length > 0 && (
            <>
              <hr className="border-sky-100 dark:border-sky-900/30" />
              <AwardsSection awards={data.awards} />
            </>
          )}

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <ClubSection clubs={data.clubs} />

          {data.activities && data.activities.length > 0 && (
            <>
              <hr className="border-sky-100 dark:border-sky-900/30" />
              <ActivitiesSection activities={data.activities} />
            </>
          )}

          {data.certifications && data.certifications.length > 0 && (
            <>
              <hr className="border-sky-100 dark:border-sky-900/30" />
              <CertificationsSection certifications={data.certifications} />
            </>
          )}
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
}
