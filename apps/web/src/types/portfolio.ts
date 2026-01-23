import type { Profile } from './resume';

export interface Club {
  name: string;
  role: string;
  period: string;
  description: string;
  activities?: string[];
  link?: string;
}

export type ProjectCategory = 'personal' | 'team' | 'club';

export interface GrowthExperience {
  title: string;
  content: string;
}

export interface PortfolioProject {
  name: string;
  category: ProjectCategory;
  clubName?: string;
  period: string;
  description: string;
  role: string;
  teamSize?: number;
  techStack: string[];
  tasks: string[];
  impact?: string[];
  growthExperience?: GrowthExperience[];
  links?: {
    label: string;
    url: string;
  }[];
  images?: string[];
}

export interface Award {
  name: string;
  prize: string;
  date: string;
  description?: string;
}

export interface Certification {
  name: string;
  date: string;
}

export interface Activity {
  date: string;
  title: string;
  description?: string;
  link?: string;
}

export interface PortfolioData {
  profile: Profile;
  clubs: Club[];
  projects: PortfolioProject[];
  awards?: Award[];
  certifications?: Certification[];
  activities?: Activity[];
}
