export interface Profile {
  name: string;
  greeting?: string;
  title?: string;
  tagline?: string;
  introduction?: string;
  birth?: string;
  phone?: string;
  email: string;
  github: string;
  blog: string;
  photo?: string;
}

export interface Skills {
  languages: string[];
  stateManagement: string[];
  libraries: string[];
  tools: string[];
  collaboration: string[];
  integrations: string[];
  infrastructure?: string[];
  testing?: string[];
}

export interface ProjectTask {
  title: string;
  items: string[];
}

export interface Project {
  name: string;
  period?: string;
  techStack?: {
    category: string;
    items: string[];
  }[] | string[];
  description: string;
  role: string;
  tasks: ProjectTask[];
  impact?: string[];
  links?: {
    label: string;
    url: string;
  }[];
  images?: string[];
}

export interface Experience {
  company: string;
  position?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  techStack: {
    category: string;
    items: string[];
  }[];
  projects: Project[];
}

export interface Education {
  school: string;
  major: string;
  period: string;
  description?: string;
}

export interface Certification {
  name: string;
  date: string;
}

export interface Award {
  date: string;
  title: string;
  description?: string;
  link?: string;
  linkLabel?: string;
}

export interface ResumeData {
  profile: Profile;
  skills: Skills;
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  awards: Award[];
}
