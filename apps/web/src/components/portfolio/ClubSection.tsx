'use client';

import { motion } from 'framer-motion';
import { Users, Calendar, Github } from 'lucide-react';
import { SectionTitle } from '../resume/SectionTitle';
import { containerVariants, itemVariants } from './constants';
import type { Club } from '@/types/portfolio';

interface ClubSectionProps {
  clubs: Club[];
}

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
        {clubs.map((club) => (
          <motion.div
            key={club.name}
            className="group border-border/60 bg-background hover:border-primary/30 hover:shadow-primary/5 relative flex h-full flex-col rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg"
            variants={itemVariants}
            whileHover={{ y: -2 }}
          >
            {/* 헤더 */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-xl">
                  <Users className="text-primary h-4 w-4" />
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
                  aria-label={`${club.name} GitHub 링크`}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* 제목 */}
            <h3 className="text-foreground group-hover:text-primary mb-1.5 text-base font-semibold tracking-tight transition-colors">
              {club.name}
            </h3>

            {/* 기간 */}
            <div className="text-muted-foreground mb-3 flex items-center gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>{club.period}</span>
            </div>

            {/* 설명 */}
            <p className="text-foreground/65 mb-4 flex-1 text-sm leading-relaxed">
              {club.description}
            </p>

            {/* 활동 내역 */}
            {club.activities && club.activities.length > 0 && (
              <div className="border-border/40 border-t pt-4">
                <h4 className="text-foreground/80 mb-2.5 text-xs font-semibold">주요 활동</h4>
                <ul className="space-y-2">
                  {club.activities.slice(0, 3).map((activity) => (
                    <li
                      key={activity}
                      className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed"
                    >
                      <span className="bg-primary/60 mt-1.5 h-1 w-1 shrink-0 rounded-full" />
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
