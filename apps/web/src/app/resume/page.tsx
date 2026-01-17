import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ResumeData } from "@/types/resume";
import resumeData from "@/data/resume.json";
import { ResumeContent } from "./ResumeContent";
import { config } from "@/config";

interface ResumeApiResponse {
  data?: ResumeData;
  error?: string;
  status?: "published" | "draft" | "not_found";
}

async function getResumeData(): Promise<ResumeApiResponse> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/resume`, {
      next: { revalidate: 60 }, // ISR: 60초마다 재검증
    });

    if (response.status === 404) {
      return { error: "Resume not published", status: "not_found" };
    }

    if (!response.ok) {
      console.warn("API fetch failed, using fallback data");
      return { data: resumeData as ResumeData, status: "published" };
    }

    const data = await response.json();
    return { data, status: "published" };
  } catch {
    console.warn("API unavailable, using fallback data");
    return { data: resumeData as ResumeData, status: "published" };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await getResumeData();

  if (!result.data) {
    return {
      title: "이력서를 찾을 수 없습니다",
      description: "요청하신 이력서가 아직 발행되지 않았습니다.",
    };
  }

  const { profile } = result.data;
  const title = `이력서 | ${profile.name}`;
  const description =
    profile.introduction ||
    `${profile.title || "개발자"} ${profile.name}의 이력서입니다.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      firstName: profile.name,
      images: profile.photo
        ? [
            {
              url: profile.photo,
              width: 400,
              height: 400,
              alt: `${profile.name} 프로필 사진`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile.photo ? [profile.photo] : undefined,
    },
  };
}

export default async function ResumePage() {
  const result = await getResumeData();

  if (result.status === "not_found" || !result.data) {
    notFound();
  }

  return (
    <>
      <ResumeContent data={result.data} />
      <JsonLd data={result.data} />
    </>
  );
}

function JsonLd({ data }: { data: ResumeData }) {
  const { profile, experience, education } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.introduction,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    image: profile.photo,
    url: profile.blog,
    sameAs: [profile.github, profile.blog].filter(Boolean),
    worksFor: experience[0]
      ? {
          "@type": "Organization",
          name: experience[0].company,
        }
      : undefined,
    alumniOf: education.map((edu) => ({
      "@type": "EducationalOrganization",
      name: edu.school,
    })),
    knowsAbout: data.skills
      ? [
          ...data.skills.languages,
          ...data.skills.libraries,
          ...data.skills.tools,
        ]
      : [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
