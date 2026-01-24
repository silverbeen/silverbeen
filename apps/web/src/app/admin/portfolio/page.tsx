'use client';

import { useCallback } from 'react';
import { portfolioApi } from '@/lib/api/portfolio';
import { JsonEditorPage, NextImage } from '@/components/admin';
import {
  ProfileSection,
  ClubSection,
  ProjectSection,
  AwardsSection,
  CertificationsSection,
  ActivitiesSection,
} from '@/components/portfolio';
import type { PortfolioData } from '@/types/portfolio';

export default function AdminPortfolioPage() {
  const fetchPortfolio = useCallback(() => portfolioApi.getPortfolio(), []);
  const savePortfolio = useCallback(
    (data: PortfolioData) => portfolioApi.updatePortfolio(data),
    []
  );

  const renderPreview = useCallback(
    (data: PortfolioData) => (
      <>
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
      </>
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
