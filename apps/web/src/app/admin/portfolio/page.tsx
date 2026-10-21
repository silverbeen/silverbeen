'use client';

import type { PortfolioData } from '@silverbeen/types';
import { portfolioApi } from '@/lib/api/portfolio';
import { DocumentEditorPage } from '@/components/editor/DocumentEditorPage';
import { PortfolioFormEditor } from '@/components/editor/portfolio';
import { PortfolioSections } from '@/components/portfolio';

const loadPortfolio = () => portfolioApi.getPortfolio();

export default function AdminPortfolioPage() {
  return (
    <DocumentEditorPage<PortfolioData>
      documentName="포트폴리오"
      load={loadPortfolio}
      save={portfolioApi.updatePortfolio}
      renderForm={(props) => <PortfolioFormEditor {...props} />}
      renderPreview={(data) => <PortfolioSections data={data} />}
    />
  );
}
