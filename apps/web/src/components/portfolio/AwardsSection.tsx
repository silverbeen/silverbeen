'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Award as AwardIcon } from 'lucide-react';
import { SectionTitle } from '../resume/SectionTitle';
import type { Award } from '@/types/portfolio';

interface AwardsSectionProps {
  awards: Award[];
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const getPrizeIcon = (prize: string) => {
  if (prize.includes('대상') || prize.includes('금')) return Trophy;
  if (prize.includes('은') || prize.includes('인기')) return Medal;
  return AwardIcon;
};

const getPrizeColor = (prize: string) => {
  if (prize.includes('대상') || prize.includes('금')) return 'text-yellow-500';
  if (prize.includes('은')) return 'text-gray-400';
  if (prize.includes('인기')) return 'text-pink-500';
  return 'text-primary';
};

export function AwardsSection({ awards }: AwardsSectionProps) {
  if (awards.length === 0) return null;

  return (
    <section id="awards">
      <SectionTitle>Awards</SectionTitle>

      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {awards.map((award, index) => {
          const Icon = getPrizeIcon(award.prize);
          const iconColor = getPrizeColor(award.prize);

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group flex items-start gap-4 rounded-xl border border-primary/10 bg-gradient-to-r from-background to-primary/5 p-4 transition-colors hover:border-primary/30"
            >
              <div className={`rounded-full bg-background p-2 shadow-sm ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{award.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {award.prize}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{award.date}</p>
                {award.description && (
                  <p className="mt-2 text-sm text-foreground/70">{award.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
