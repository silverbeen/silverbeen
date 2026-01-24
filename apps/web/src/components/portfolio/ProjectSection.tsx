'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Briefcase, Users, FolderGit2, Layers } from 'lucide-react';
import { SectionTitle } from '../resume/SectionTitle';
import { ProjectCard } from './ProjectCard';
import { ProjectDetailModal } from './ProjectDetailModal';
import type { PortfolioProject, ProjectCategory } from '@/types/portfolio';

interface ProjectSectionProps {
  projects: PortfolioProject[];
}

const categories: { value: ProjectCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: '전체', icon: Layers },
  { value: 'personal', label: '개인', icon: Briefcase },
  { value: 'team', label: '팀', icon: Users },
  { value: 'club', label: '동아리', icon: FolderGit2 },
];

type SortOrder = 'newest' | 'oldest';

const sortOptions: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
];

function parseDate(dateStr: string): Date {
  const match = dateStr.match(/^(\d{4})\.(\d{2})/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1);
  }
  return new Date(0);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function ProjectSection({ projects }: ProjectSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const filteredAndSortedProjects = useMemo(() => {
    // hidden이 아닌 프로젝트만 필터링
    const visibleProjects = projects.filter((p) => !p.hidden);

    const filtered = selectedCategory === 'all'
      ? visibleProjects
      : visibleProjects.filter((p) => p.category === selectedCategory);

    return [...filtered].sort((a, b) => {
      const dateA = parseDate(a.period);
      const dateB = parseDate(b.period);
      return sortOrder === 'newest'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  }, [projects, selectedCategory, sortOrder]);

  return (
    <section id="projects">
      <SectionTitle>Projects</SectionTitle>

      {/* 필터 & 정렬 컨트롤 */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 카테고리 탭 */}
        <div className="relative flex gap-1 rounded-xl bg-muted/50 p-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 rounded-lg bg-background shadow-sm"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 정렬 드롭다운 */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="cursor-pointer appearance-none rounded-lg border border-border/60 bg-background/80 py-2 pr-9 pl-4 text-sm font-medium text-foreground/80 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        </div>
      </div>

      {/* 프로젝트 카운트 */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{filteredAndSortedProjects.length}</span>개의 프로젝트
        </span>
      </div>

      {/* 프로젝트 그리드 */}
      <AnimatePresence mode="wait">
        <motion.div
          className="grid gap-6 sm:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          key={`${selectedCategory}-${sortOrder}`}
        >
          {filteredAndSortedProjects.map((project, index) => (
            <motion.div key={`${project.name}-${index}`} variants={itemVariants}>
              <ProjectCard project={project} onClick={() => setSelectedProject(project)} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredAndSortedProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="mb-4 rounded-full bg-muted/50 p-4">
            <Layers className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-center text-muted-foreground">
            해당 카테고리의 프로젝트가 없습니다.
          </p>
        </motion.div>
      )}

      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        projects={filteredAndSortedProjects}
        onNavigate={setSelectedProject}
      />
    </section>
  );
}
