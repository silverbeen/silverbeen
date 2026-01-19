"use client";

import Image from "next/image";
import {
  ProfileSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  CertificationSection,
  AwardSection,
  TableOfContents,
  PdfExportButton,
  PageCaptureButton,
} from "@/components/resume";
import type { ResumeData } from "@/types/resume";

// Next.js Image wrapper for the UI components
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

interface ResumeContentProps {
  data: ResumeData;
}

export function ResumeContent({ data }: ResumeContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <TableOfContents experience={data.experience} />
      <PdfExportButton data={data} />
      <PageCaptureButton />
      <main id="resume-content" className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-col gap-12">
          <ProfileSection profile={data.profile} ImageComponent={NextImage} />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <SkillsSection skills={data.skills} />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <ExperienceSection
            experience={data.experience}
            ImageComponent={NextImage}
          />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <EducationSection education={data.education} />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <CertificationSection certifications={data.certifications} />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <AwardSection awards={data.awards} />
        </div>
      </main>
    </div>
  );
}
