'use client';

import { motion } from 'framer-motion';
import { Users, Calendar, Github, ExternalLink } from 'lucide-react';
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
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function ClubSection({ clubs }: ClubSectionProps) {
  if (clubs.length === 0) return null;

  return (
    <section id="clubs">
      <SectionTitle>Clubs</SectionTitle>
      <motion.div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {clubs.map((club, index) => (
          <motion.div
            key={index}
            className="group relative flex h-full flex-col rounded-2xl border border-border/60 bg-background p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            variants={itemVariants}
            whileHover={{ y: -2 }}
          >
            {/* 헤더 */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-4.5 w-4.5 text-primary" />
                </div>
                <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {club.role}
                </span>
              </div>
              {club.link && (
                <a
                  href={club.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* 제목 */}
            <h3 className="mb-1.5 text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {club.name}
            </h3>

            {/* 기간 */}
            <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{club.period}</span>
            </div>

            {/* 설명 */}
            <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/65">{club.description}</p>

            {/* 활동 내역 */}
            {club.activities && club.activities.length > 0 && (
              <div className="border-t border-border/40 pt-4">
                <h4 className="mb-2.5 text-xs font-semibold text-foreground/80">주요 활동</h4>
                <ul className="space-y-2">
                  {club.activities.slice(0, 3).map((activity, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                      <span className="line-clamp-2">{activity}</span>
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
