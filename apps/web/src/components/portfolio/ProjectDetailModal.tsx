'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Users, Briefcase, FolderGit2, Calendar, Sparkles, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PortfolioProject } from '@/types/portfolio';

interface ProjectDetailModalProps {
  project: PortfolioProject | null;
  isOpen: boolean;
  onClose: () => void;
  projects?: PortfolioProject[];
  onNavigate?: (project: PortfolioProject) => void;
}

const categoryConfig = {
  personal: {
    label: '개인 프로젝트',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  team: {
    label: '팀 프로젝트',
    icon: Users,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  club: {
    label: '동아리 프로젝트',
    icon: FolderGit2,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
};

function NavigationCard({
  project,
  direction,
  onClick
}: {
  project: PortfolioProject;
  direction: 'prev' | 'next';
  onClick: () => void;
}) {
  const config = categoryConfig[project.category];
  const CategoryIcon = config.icon;
  const isPrev = direction === 'prev';

  return (
    <button
      onClick={onClick}
      className={`group fixed top-1/2 -translate-y-1/2 z-60 hidden md:flex items-center gap-2 ${
        isPrev ? 'left-4 flex-row-reverse' : 'right-4'
      }`}
    >
      <motion.div
        className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-background/95 text-muted-foreground shadow-lg backdrop-blur-sm transition-all group-hover:border-primary/40 group-hover:text-primary"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPrev ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </motion.div>

      <motion.div
        className={`w-48 rounded-xl border border-primary/10 bg-background/95 p-3 shadow-lg backdrop-blur-sm ${
          isPrev ? 'text-right' : 'text-left'
        }`}
        initial={{ opacity: 0, x: isPrev ? 10 : -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`mb-1 flex items-center gap-1.5 ${isPrev ? 'justify-end' : ''}`}>
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.color}`}>
            <CategoryIcon className="h-2.5 w-2.5" />
            {categoryConfig[project.category].label.replace(' 프로젝트', '')}
          </span>
        </div>
        <p className="text-sm font-semibold text-foreground line-clamp-1">{project.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{project.period}</p>
      </motion.div>
    </button>
  );
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  projects = [],
  onNavigate,
}: ProjectDetailModalProps) {
  const currentIndex = project ? projects.findIndex(p => p.name === project.name) : -1;
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  const handleNavigate = useCallback((targetProject: PortfolioProject) => {
    if (onNavigate) {
      onNavigate(targetProject);
    }
  }, [onNavigate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowLeft' && prevProject) {
      handleNavigate(prevProject);
    } else if (e.key === 'ArrowRight' && nextProject) {
      handleNavigate(nextProject);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [isOpen, prevProject, nextProject, handleNavigate, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!project) return null;

  const config = categoryConfig[project.category];
  const CategoryIcon = config.icon;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {prevProject && (
            <NavigationCard
              project={prevProject}
              direction="prev"
              onClick={() => handleNavigate(prevProject)}
            />
          )}
          {nextProject && (
            <NavigationCard
              project={nextProject}
              direction="next"
              onClick={() => handleNavigate(nextProject)}
            />
          )}

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key={project.name}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-primary/20 bg-background shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-primary/10 bg-background/95 px-6 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
                    <CategoryIcon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                  {project.clubName && (
                    <span className="text-sm text-muted-foreground">@ {project.clubName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {projects.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      {currentIndex + 1} / {projects.length}
                    </span>
                  )}
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h2 className="mb-2 text-2xl font-bold text-foreground">{project.name}</h2>

                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {project.period}
                  </span>
                  <span className="font-medium text-foreground">{project.role}</span>
                  {project.teamSize && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {project.teamSize}명
                    </span>
                  )}
                </div>

                <p className="mb-6 text-foreground/80 leading-relaxed">{project.description}</p>

                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">기술 스택</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-3 py-1.5 text-sm font-medium text-foreground/80"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {project.tasks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">담당 업무</h3>
                    <ul className="space-y-2">
                      {project.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.impact && project.impact.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      성과
                    </h3>
                    <div className="space-y-2">
                      {project.impact.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-primary/5 p-3 text-sm text-primary"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.growthExperience && project.growthExperience.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      성장 경험
                    </h3>
                    <div className="space-y-4">
                      {project.growthExperience.map((exp, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-4 dark:border-amber-900/30 dark:from-amber-900/10 dark:to-orange-900/10"
                        >
                          <h4 className="mb-2 font-semibold text-amber-700 dark:text-amber-400">
                            {exp.title}
                          </h4>
                          <p className="text-sm leading-relaxed text-foreground/80">
                            {exp.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.links && project.links.length > 0 && (
                  <div className="border-t border-primary/10 pt-4">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">링크</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          {link.label.toLowerCase().includes('github') ? (
                            <Github className="h-4 w-4" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Navigation */}
              {projects.length > 1 && (
                <div className="sticky bottom-0 flex items-center justify-between border-t border-primary/10 bg-background/95 px-4 py-3 backdrop-blur-sm md:hidden">
                  <button
                    onClick={() => prevProject && handleNavigate(prevProject)}
                    disabled={!prevProject}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="max-w-24 truncate">{prevProject?.name || '이전'}</span>
                  </button>
                  <button
                    onClick={() => nextProject && handleNavigate(nextProject)}
                    disabled={!nextProject}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent"
                  >
                    <span className="max-w-24 truncate">{nextProject?.name || '다음'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
