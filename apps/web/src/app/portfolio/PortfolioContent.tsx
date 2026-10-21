import { PortfolioSections } from '@/components/portfolio';
import { ScrollToTopButton } from '@/components/post/ScrollToTopButton';
import { PdfExportButton } from '@/components/ui/PdfExportButton';
import type { PortfolioData } from '@silverbeen/types';

interface PortfolioContentProps {
  data: PortfolioData;
}

export function PortfolioContent({ data }: PortfolioContentProps) {
  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-col gap-12">
          <PortfolioSections data={data} />
        </div>
      </main>
      <ScrollToTopButton />
      <PdfExportButton
        endpoint="/api/generate-portfolio-pdf"
        fallbackFilename="portfolio.pdf"
        label="포트폴리오 PDF 생성 중..."
      />
    </div>
  );
}
