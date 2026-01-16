import type { Metadata } from "next";
import type { ResumeData } from "@/types/resume";
import resumeData from "@/data/resume.json";
import { ResumeContent } from "./ResumeContent";

export const metadata: Metadata = {
  title: "이력서 | 강은빈",
  description: "프론트엔드 개발자 강은빈의 이력서입니다.",
};

export default function ResumePage() {
  const data = resumeData as ResumeData;

  return <ResumeContent data={data} />;
}
