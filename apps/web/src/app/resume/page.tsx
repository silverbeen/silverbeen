import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ResumeData } from '@/types/resume';
import resumeData from '@/data/resume.json';
import { ResumeContent } from './ResumeContent';
import { ScrollToTopButton } from '@/components/post/ScrollToTopButton';
import { api, ApiError } from '@/lib/api';

async function getResumeData(): Promise<ResumeData | null> {
  try {
    return await api.resume.get({ revalidate: 60 });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.warn('API unavailable, using fallback data');
    return resumeData as ResumeData;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getResumeData();

  if (!data) {
    return {
      title: '이력서를 찾을 수 없습니다',
      description: '요청하신 이력서가 아직 발행되지 않았습니다.',
    };
  }

  const { profile } = data;
  const title = `이력서 | ${profile.name}`;
  const description =
    profile.introduction || `${profile.title || '개발자'} ${profile.name}의 이력서입니다.`;

  console.log(profile.photo);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      firstName: profile.name,
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
  };
}

export default async function ResumePage() {
  const data = await getResumeData();

  if (!data) {
    notFound();
  }

  return (
    <>
      <ResumeContent data={data} />
      <JsonLd data={data} />
      <ScrollToTopButton />
    </>
  );
}

function JsonLd({ data }: { data: ResumeData }) {
  const { profile, experience, education, skills } = data;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: profile.introduction,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    image: profile.photo,
    url: profile.blog,
    sameAs: [profile.github, profile.blog].filter(Boolean),
    worksFor: experience[0] ? { '@type': 'Organization', name: experience[0].company } : undefined,
    alumniOf: education.map((edu) => ({
      '@type': 'EducationalOrganization',
      name: edu.school,
    })),
    knowsAbout: skills ? [...skills.languages, ...skills.libraries, ...skills.tools] : [],
  };

  const safeJson = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson }} />;
}
