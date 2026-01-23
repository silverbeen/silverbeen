'use client';

import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { SectionTitle } from '../resume/SectionTitle';
import type { Certification } from '@/types/portfolio';

interface CertificationsSectionProps {
  certifications: Certification[];
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
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (certifications.length === 0) return null;

  return (
    <section id="certifications">
      <SectionTitle>Certifications</SectionTitle>

      <motion.div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {certifications.map((cert, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex items-center gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-background to-primary/5 p-4 transition-colors hover:border-primary/30"
          >
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{cert.name}</h3>
              <p className="text-sm text-muted-foreground">{cert.date}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
