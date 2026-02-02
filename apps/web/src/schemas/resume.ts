import { z } from 'zod';

// Profile 스키마
export const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  greeting: z.string().optional(),
  title: z.string().optional(),
  tagline: z.string().optional(),
  introduction: z.string().optional(),
  birth: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  github: z.string().url('유효한 URL을 입력해주세요'),
  blog: z.string().url('유효한 URL을 입력해주세요'),
  linkedin: z.string().url().optional().or(z.literal('')),
  photo: z.string().url().optional().or(z.literal('')),
});

// Skills 스키마
export const skillsSchema = z.object({
  languages: z.array(z.string()),
  stateManagement: z.array(z.string()),
  libraries: z.array(z.string()),
  tools: z.array(z.string()),
  collaboration: z.array(z.string()),
  integrations: z.array(z.string()),
  infrastructure: z.array(z.string()).optional(),
  testing: z.array(z.string()).optional(),
});

// ProjectTask 스키마
export const projectTaskSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  items: z.array(z.string()),
});

// TechStack 스키마
export const techStackSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

// Project 스키마
export const projectSchema = z.object({
  name: z.string().min(1, '프로젝트명을 입력해주세요'),
  period: z.string().optional(),
  techStack: z.union([z.array(techStackSchema), z.array(z.string())]).optional(),
  description: z.string().min(1, '설명을 입력해주세요'),
  role: z.string().min(1, '역할을 입력해주세요'),
  tasks: z.array(projectTaskSchema),
  impact: z.array(z.string()).optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
  images: z.array(z.string().url()).optional(),
});

// Experience 스키마
export const experienceSchema = z.object({
  company: z.string().min(1, '회사명을 입력해주세요'),
  position: z.string().optional(),
  startDate: z.string().min(1, '시작일을 입력해주세요'),
  endDate: z.string().optional(),
  description: z.string().optional(),
  techStack: z.array(techStackSchema),
  projects: z.array(projectSchema),
});

// Education 스키마
export const educationSchema = z.object({
  school: z.string().min(1, '학교명을 입력해주세요'),
  major: z.string().min(1, '전공을 입력해주세요'),
  period: z.string().min(1, '기간을 입력해주세요'),
  description: z.string().optional(),
});

// Certification 스키마
export const certificationSchema = z.object({
  name: z.string().min(1, '자격증명을 입력해주세요'),
  date: z.string().min(1, '취득일을 입력해주세요'),
});

// Award 스키마
export const awardSchema = z.object({
  date: z.string().min(1, '날짜를 입력해주세요'),
  title: z.string().min(1, '수상명을 입력해주세요'),
  description: z.string().optional(),
  link: z.string().url().optional().or(z.literal('')),
  linkLabel: z.string().optional(),
});

// CoreCompetency 스키마
export const coreCompetencySchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().min(1, '설명을 입력해주세요'),
});

// CareerSummary 스키마
export const careerSummarySchema = z.object({
  company: z.string().min(1, '회사명을 입력해주세요'),
  position: z.string().min(1, '직책을 입력해주세요'),
  startDate: z.string().min(1, '시작일을 입력해주세요'),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

// 전체 이력서 스키마
export const resumeSchema = z.object({
  profile: profileSchema,
  skills: skillsSchema,
  coreCompetencies: z.array(coreCompetencySchema).optional(),
  careerSummary: z.array(careerSummarySchema).optional(),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  awards: z.array(awardSchema),
});

export type ResumeFormData = z.infer<typeof resumeSchema>;
