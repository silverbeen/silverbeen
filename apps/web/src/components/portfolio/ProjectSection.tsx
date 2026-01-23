'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionTitle } from '../resume/SectionTitle';
import { ProjectCard } from './ProjectCard';
import { ProjectDetailModal } from './ProjectDetailModal';
import type { PortfolioProject, ProjectCategory } from '@/types/portfolio';

interface ProjectSectionProps {
  projects: PortfolioProject[];
}

const categories: { value: ProjectCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'personal', label: '개인' },
  { value: 'team', label: '팀' },
  { value: 'club', label: '동아리' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function ProjectSection({ projects }: ProjectSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects">
      <SectionTitle>Projects</SectionTitle>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === cat.value
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <motion.div
        className="grid gap-6 sm:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        key={selectedCategory}
      >
        {filteredProjects.map((project, index) => (
          <motion.div key={`${project.name}-${index}`} variants={itemVariants}>
            <ProjectCard project={project} onClick={() => setSelectedProject(project)} />
          </motion.div>
        ))}
      </motion.div>

      {filteredProjects.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          해당 카테고리의 프로젝트가 없습니다.
        </p>
      )}

      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        projects={filteredProjects}
        onNavigate={setSelectedProject}
      />
    </section>
  );
}
