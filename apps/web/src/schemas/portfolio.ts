import { z } from 'zod';
import { profileSchema, skillsSchema, educationSchema } from './resume';

// Club 스키마
export const clubSchema = z.object({
  name: z.string().min(1, '동아리명을 입력해주세요'),
  role: z.string().min(1, '역할을 입력해주세요'),
  period: z.string().min(1, '기간을 입력해주세요'),
  description: z.string().min(1, '설명을 입력해주세요'),
  activities: z.array(z.string()).optional(),
  link: z.string().url().optional().or(z.literal('')),
});

// GrowthExperience 스키마
export const growthExperienceSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
});

// PortfolioProject 스키마
export const portfolioProjectSchema = z.object({
  name: z.string().min(1, '프로젝트명을 입력해주세요'),
  category: z.enum(['personal', 'team', 'club']),
  clubName: z.string().optional(),
  period: z.string().min(1, '기간을 입력해주세요'),
  description: z.string().min(1, '설명을 입력해주세요'),
  role: z.string().min(1, '역할을 입력해주세요'),
  teamSize: z.number().optional(),
  techStack: z.array(z.string()),
  tasks: z.array(z.string()),
  impact: z.array(z.string()).optional(),
  growthExperience: z.array(growthExperienceSchema).optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
  images: z.array(z.string().url()).optional(),
  hidden: z.boolean().optional(),
  pdfHidden: z.boolean().optional(),
});

// Portfolio Award 스키마
export const portfolioAwardSchema = z.object({
  name: z.string().min(1, '수상명을 입력해주세요'),
  prize: z.string().min(1, '상훈을 입력해주세요'),
  date: z.string().min(1, '날짜를 입력해주세요'),
  description: z.string().optional(),
});

// Portfolio Certification 스키마
export const portfolioCertificationSchema = z.object({
  name: z.string().min(1, '자격증명을 입력해주세요'),
  date: z.string().min(1, '취득일을 입력해주세요'),
});

// Activity 스키마
export const activitySchema = z.object({
  date: z.string().min(1, '날짜를 입력해주세요'),
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  link: z.string().url().optional().or(z.literal('')),
});

// 전체 포트폴리오 스키마
export const portfolioSchema = z.object({
  profile: profileSchema,
  skills: skillsSchema.optional(),
  education: z.array(educationSchema).optional(),
  clubs: z.array(clubSchema),
  projects: z.array(portfolioProjectSchema),
  awards: z.array(portfolioAwardSchema).optional(),
  certifications: z.array(portfolioCertificationSchema).optional(),
  activities: z.array(activitySchema).optional(),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;
