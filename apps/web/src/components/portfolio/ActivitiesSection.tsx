'use client';

import { motion } from 'framer-motion';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { SectionTitle } from '../resume/SectionTitle';
import { containerVariants } from './constants';
import type { Activity } from '@/types/portfolio';

interface ActivitiesSectionProps {
  activities: Activity[];
}

const activityItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
} as const;

export function ActivitiesSection({ activities }: ActivitiesSectionProps) {
  if (activities.length === 0) return null;

  return (
    <section id="activities">
      <SectionTitle>Activities</SectionTitle>

      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {activities.map((activity) => (
          <motion.div
            key={`${activity.title}-${activity.date}`}
            variants={activityItemVariants}
            className="flex items-start gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-background to-primary/5 p-4 transition-colors hover:border-primary/30"
          >
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{activity.title}</h3>
                  {activity.link && (
                    <a
                      href={activity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${activity.title} 링크`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{activity.date}</span>
              </div>
              {activity.description && (
                <p className="mt-1 text-sm text-foreground/70">{activity.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
