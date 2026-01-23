'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Users, Calendar, Github } from 'lucide-react';
import { SectionTitle } from '../resume/SectionTitle';
import type { Club } from '@/types/portfolio';

interface ClubSectionProps {
  clubs: Club[];
}

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

export function ClubSection({ clubs }: ClubSectionProps) {
  if (clubs.length === 0) return null;

  return (
    <section id="clubs">
      <SectionTitle>Clubs</SectionTitle>
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {clubs.map((club, index) => (
          <motion.div
            key={index}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-6 transition-colors duration-300 hover:border-primary/40"
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {/* 배경 그라데이션 효과 */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:bg-primary/20" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

            {/* 헤더 */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {club.role}
                </span>
              </div>
              {club.link && (
                <motion.a
                  href={club.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="h-4 w-4" />
                </motion.a>
              )}
            </div>

            {/* 제목 */}
            <h3 className="mb-2 text-lg font-semibold text-foreground">{club.name}</h3>

            {/* 기간 */}
            <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{club.period}</span>
            </div>

            {/* 설명 */}
            <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/70">{club.description}</p>

            {/* 활동 내역 */}
            {club.activities && club.activities.length > 0 && (
              <div className="border-t border-primary/10 pt-4">
                <h4 className="mb-2 text-xs font-semibold text-foreground">주요 활동</h4>
                <ul className="space-y-1.5">
                  {club.activities.slice(0, 3).map((activity, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      <span className="line-clamp-1">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
