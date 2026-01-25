'use client';

import { useCallback } from 'react';
import { portfolioApi } from '@/lib/api/portfolio';
import { JsonEditorPage, NextImage } from '@/components/admin';
import { PortfolioSections } from '@/components/portfolio';
import type { PortfolioData } from '@/types/portfolio';

export default function AdminPortfolioPage() {
  const fetchPortfolio = useCallback(() => portfolioApi.getPortfolio(), []);
  const savePortfolio = useCallback(
    (data: PortfolioData, token: string) => portfolioApi.updatePortfolio(data, token),
    []
  );

  const renderPreview = useCallback(
    (data: PortfolioData) => (
      <PortfolioSections data={data} ImageComponent={NextImage} />
    ),
    []
  );

  return (
    <JsonEditorPage<PortfolioData>
      pageTitle="포트폴리오 편집"
      fetchErrorMessage="포트폴리오 데이터를 불러오는데 실패했습니다."
      saveSuccessMessage="포트폴리오가 저장되었습니다."
      fetchData={fetchPortfolio}
      saveData={savePortfolio}
      renderPreview={renderPreview}
    />
  );
}
