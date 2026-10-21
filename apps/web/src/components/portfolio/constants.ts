import { Briefcase, Users, FolderGit2 } from 'lucide-react';
import type { ProjectCategory } from '@silverbeen/types';
import { PROJECT_CATEGORY_LABELS } from '@/constants/portfolio';

export const categoryConfig: Record<
  ProjectCategory,
  {
    label: string;
    shortLabel: string;
    icon: typeof Briefcase;
    color: string;
    gradient: string;
    accent: string;
  }
> = {
  personal: {
    ...PROJECT_CATEGORY_LABELS.personal,
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    gradient: 'from-blue-500/5 via-transparent to-transparent',
    accent: 'border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400',
  },
  team: {
    ...PROJECT_CATEGORY_LABELS.team,
    icon: Users,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    gradient: 'from-emerald-500/5 via-transparent to-transparent',
    accent: 'border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  },
  club: {
    ...PROJECT_CATEGORY_LABELS.club,
    icon: FolderGit2,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    gradient: 'from-violet-500/5 via-transparent to-transparent',
    accent: 'border border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400',
  },
};

// 공통 애니메이션 variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

export const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
} as const;

export const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
} as const;

export const scaleItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
} as const;
