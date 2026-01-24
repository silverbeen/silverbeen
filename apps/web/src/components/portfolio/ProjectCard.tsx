'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github, Users, Briefcase, FolderGit2, ArrowUpRight } from 'lucide-react';
import type { PortfolioProject } from '@/types/portfolio';

interface ProjectCardProps {
  project: PortfolioProject;
  onClick?: () => void;
}

const categoryConfig = {
  personal: {
    label: '개인',
    icon: Briefcase,
    gradient: 'from-blue-500/5 via-transparent to-transparent',
    accent: 'border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400',
  },
  team: {
    label: '팀',
    icon: Users,
    gradient: 'from-emerald-500/5 via-transparent to-transparent',
    accent: 'border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  },
  club: {
    label: '동아리',
    icon: FolderGit2,
    gradient: 'from-violet-500/5 via-transparent to-transparent',
    accent: 'border border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400',
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
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br ${config.gradient} p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {/* 상단 메타 정보 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${config.accent}`}>
            <CategoryIcon className="h-3.5 w-3.5" />
            {config.label}
          </span>
          {project.clubName && (
            <span className="text-xs text-muted-foreground/80">@ {project.clubName}</span>
          )}
        </div>
        <span className="rounded-md bg-muted/50 px-2 py-1 text-xs text-muted-foreground">{project.period}</span>
      </div>

      {/* 제목 & 설명 */}
      <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
        {project.name}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/65 line-clamp-3">{project.description}</p>

      {/* 역할 & 팀 규모 */}
      <div className="mb-4 flex items-center gap-3 text-xs">
        <span className="font-medium text-foreground/80">{project.role}</span>
        {project.teamSize && (
          <>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              {project.teamSize}명
            </span>
          </>
        )}
      </div>

      {/* 기술 스택 */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {project.techStack.slice(0, 5).map((tech, idx) => (
          <span
            key={idx}
            className="rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-foreground/70"
          >
            {tech}
          </span>
        ))}
        {project.techStack.length > 5 && (
          <span className="rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground">
            +{project.techStack.length - 5}
          </span>
        )}
      </div>

      {/* 성과 하이라이트 */}
      {project.impact && project.impact.length > 0 && (
        <div className="mb-4 rounded-xl bg-primary/5 px-4 py-3">
          <p className="text-xs font-medium leading-relaxed text-primary/90">{project.impact[0]}</p>
        </div>
      )}

      {/* 하단 링크 & 더보기 */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
        <div className="flex gap-2">
          {project.links?.slice(0, 2).map((link, idx) => (
            <motion.a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
              whileTap={{ scale: 0.95 }}
              onClick={handleLinkClick}
            >
              {link.label.toLowerCase().includes('github') ? (
                <Github className="h-3.5 w-3.5" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" />
              )}
              {link.label}
            </motion.a>
          ))}
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
          상세보기
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.div>
  );
}
