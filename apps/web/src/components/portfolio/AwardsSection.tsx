'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Award as AwardIcon, Sparkles } from 'lucide-react';
import { SectionTitle } from '../resume/SectionTitle';
import { containerVariants } from './constants';
import type { Award } from '@/types/portfolio';

interface AwardsSectionProps {
  awards: Award[];
}

const awardItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

const getPrizeConfig = (prize: string) => {
  if (prize.includes('대상') || prize.includes('금')) {
    return {
      icon: Trophy,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    };
  }
  if (prize.includes('은')) {
    return {
      icon: Medal,
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-400',
      badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    };
  }
  if (prize.includes('인기')) {
    return {
      icon: Sparkles,
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-500',
      badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    };
  }
  return {
    icon: AwardIcon,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    badge: 'bg-primary/10 text-primary border-primary/20',
  };
};

export function AwardsSection({ awards }: AwardsSectionProps) {
  if (awards.length === 0) return null;

  return (
    <section id="awards">
      <SectionTitle>Awards</SectionTitle>

      <motion.div
        className="grid gap-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {awards.map((award) => {
          const config = getPrizeConfig(award.prize);
          const Icon = config.icon;

          return (
            <motion.div
              key={`${award.name}-${award.date}`}
              variants={awardItemVariants}
              className="group flex items-start gap-4 rounded-xl border border-border/60 bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground tracking-tight">{award.name}</h3>
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${config.badge}`}>
                    {award.prize}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{award.date}</p>
                {award.description && (
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65">{award.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
