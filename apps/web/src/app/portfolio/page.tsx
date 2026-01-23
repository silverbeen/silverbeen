import type { Metadata } from 'next';
import { config } from '@/config';
import type { PortfolioData } from '@/types/portfolio';
import portfolioData from '@/data/portfolio.json';
import { PortfolioContent } from './PortfolioContent';

function getPortfolioData(): PortfolioData {
  return portfolioData as PortfolioData;
}

export function generateMetadata(): Metadata {
  const data = getPortfolioData();
  const { profile } = data;
  const title = `포트폴리오 | ${profile.name}`;
  const description = `${profile.title || '개발자'} ${profile.name}의 포트폴리오입니다. 프로젝트 경험과 기술 스택을 확인하세요.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${config.siteUrl}/portfolio`,
      type: 'profile',
      images: profile.photo
        ? [{ url: profile.photo, width: 400, height: 400, alt: `${profile.name} 프로필 사진` }]
        : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: profile.photo ? [profile.photo] : undefined,
    },
    alternates: {
      canonical: `${config.siteUrl}/portfolio`,
    },
  };
}

export default function PortfolioPage() {
  const data = getPortfolioData();

  return (
    <>
      <PortfolioContent data={data} />
      <JsonLd data={data} />
    </>
  );
}

function JsonLd({ data }: { data: PortfolioData }) {
  const { profile, projects } = data;

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: profile.introduction,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    image: profile.photo,
    url: `${config.siteUrl}/portfolio`,
    sameAs: [profile.github, profile.blog].filter(Boolean),
  };

  const portfolioJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${profile.name}의 프로젝트`,
    description: `${profile.name}이 참여한 프로젝트 목록`,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: project.name,
        description: project.description,
        dateCreated: project.period.split(' - ')[0],
        author: {
          '@type': 'Person',
          name: profile.name,
        },
      },
    })),
  };

  const safePersonJson = JSON.stringify(personJsonLd).replace(/</g, '\\u003c');
  const safePortfolioJson = JSON.stringify(portfolioJsonLd).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safePersonJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safePortfolioJson }} />
    </>
  );
}
