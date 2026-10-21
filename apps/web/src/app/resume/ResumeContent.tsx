import { ResumeSections, TableOfContents } from '@/components/resume';
import { PdfExportButton } from '@/components/ui/PdfExportButton';
import type { ResumeData } from '@silverbeen/types';

interface ResumeContentProps {
  data: ResumeData;
}

export function ResumeContent({ data }: ResumeContentProps) {
  return (
    <div className="bg-background min-h-screen">
      <TableOfContents experience={data.experience} />
      <PdfExportButton endpoint="/api/generate-pdf" fallbackFilename="resume.pdf" />
      <main id="resume-content" className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-col gap-12">
          <ResumeSections data={data} />
        </div>
      </main>
    </div>
  );
}
