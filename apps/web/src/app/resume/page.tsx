import type { Metadata } from "next";
import type { ResumeData } from "@/types/resume";
import resumeData from "@/data/resume.json";
import { ResumeContent } from "./ResumeContent";
import { config } from "@/config";

export const metadata: Metadata = {
  title: "이력서 | 강은빈",
  description: "프론트엔드 개발자 강은빈의 이력서입니다.",
};

async function getResumeData(): Promise<ResumeData> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/resume`, {
      next: { revalidate: 60 }, // ISR: 60초마다 재검증
    });

    if (!response.ok) {
      console.warn("API fetch failed, using fallback data");
      return resumeData as ResumeData;
    }

    return response.json();
  } catch {
    console.warn("API unavailable, using fallback data");
    return resumeData as ResumeData;
  }
}

export default async function ResumePage() {
  const data = await getResumeData();

  return <ResumeContent data={data} />;
}
