'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github, Users, Briefcase, FolderGit2, ArrowRight } from 'lucide-react';
import type { PortfolioProject } from '@/types/portfolio';

interface ProjectCardProps {
  project: PortfolioProject;
  onClick?: () => void;
}

const categoryConfig = {
  personal: {
    label: '개인',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  team: {
    label: '팀',
    icon: Users,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  club: {
    label: '동아리',
    icon: FolderGit2,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const config = categoryConfig[project.category];
  const CategoryIcon = config.icon;

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-6 transition-colors duration-300 hover:border-primary/40"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {/* 배경 그라데이션 효과 */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:bg-primary/20" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
            <CategoryIcon className="h-3 w-3" />
            {config.label}
          </span>
          {project.clubName && (
            <span className="text-xs text-muted-foreground">@ {project.clubName}</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{project.period}</span>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">{project.name}</h3>
      <p className="mb-4 flex-1 text-sm text-foreground/70">{project.description}</p>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{project.role}</span>
        {project.teamSize && (
          <>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.teamSize}명
            </span>
          </>
        )}
      </div>

      <div className="relative mb-4 flex flex-wrap gap-1.5">
        {project.techStack.slice(0, 6).map((tech, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-2.5 py-1 text-xs font-medium text-foreground/80 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            {tech}
          </span>
        ))}
        {project.techStack.length > 6 && (
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-2.5 py-1 text-xs font-medium text-foreground/80">
            +{project.techStack.length - 6}
          </span>
        )}
      </div>

      {project.tasks.length > 0 && (
        <ul className="mb-4 space-y-1 text-sm text-muted-foreground">
          {project.tasks.slice(0, 3).map((task, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span className="line-clamp-1">{task}</span>
            </li>
          ))}
        </ul>
      )}

      {project.impact && project.impact.length > 0 && (
        <div className="mb-4 rounded-lg bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary">{project.impact[0]}</p>
        </div>
      )}

      <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-3 border-t border-primary/10">
        {project.links && project.links.length > 0 && (
          <>
            {project.links.map((link, idx) => (
              <motion.a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLinkClick}
              >
                {link.label.toLowerCase().includes('github') ? (
                  <Github className="h-3 w-3" />
                ) : (
                  <ExternalLink className="h-3 w-3" />
                )}
                {link.label}
              </motion.a>
            ))}
          </>
        )}
        <motion.span
          className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary"
          whileHover={{ x: 2 }}
        >
          더보기
          <ArrowRight className="h-3 w-3" />
        </motion.span>
      </div>
    </motion.div>
  );
}
