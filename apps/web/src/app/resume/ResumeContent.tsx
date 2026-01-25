"use client";

import Image from "next/image";
import {
  ResumeSections,
  TableOfContents,
  PdfExportButton,
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
      <PdfExportButton />
      <main id="resume-content" className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-col gap-12">
          <ResumeSections data={data} ImageComponent={NextImage} />
        </div>
      </main>
    </div>
  );
}
