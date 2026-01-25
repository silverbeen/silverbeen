'use client';

import Image from 'next/image';
import { PortfolioSections } from '@/components/portfolio';
import { ScrollToTopButton } from '@/components/post/ScrollToTopButton';
import { PortfolioPdfExportButton } from '@/components/portfolio/PortfolioPdfExportButton';
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
          <PortfolioSections data={data} ImageComponent={NextImage} />
        </div>
      </main>
      <ScrollToTopButton />
      <PortfolioPdfExportButton />
    </div>
  );
}
