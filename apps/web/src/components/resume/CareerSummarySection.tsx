"use client";

import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import type { CareerSummary } from "@/types/resume";
import { SectionTitle } from "./SectionTitle";
import { calculateDuration, calculateTotalExperience, formatPeriod } from "@/utils/date";

interface CareerSummarySectionProps {
  careerSummary: CareerSummary[];
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
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function CareerSummarySection({ careerSummary }: CareerSummarySectionProps) {
  if (!careerSummary || careerSummary.length === 0) {
    return null;
  }

  const totalExperience = calculateTotalExperience(careerSummary);

  return (
    <section id="career-summary">
      <SectionTitle>
        경력
        {totalExperience && (
          <span className="ml-2 text-base font-medium text-muted-foreground">
            총 {totalExperience}
          </span>
        )}
      </SectionTitle>
      <motion.div
        className="flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {careerSummary.map((career) => {
          const duration = calculateDuration(career.startDate, career.endDate);
          const period = formatPeriod(career.startDate, career.endDate);

          return (
            <motion.div
              key={`${career.company}-${career.startDate}-${career.endDate || 'current'}`}
              className="group flex items-start gap-4"
              variants={itemVariants}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Briefcase className="h-5 w-5 text-accent-foreground" />
              </motion.div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {career.company}
                  </h3>
                  <motion.span
                    className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground"
                    whileHover={{ scale: 1.05 }}
                  >
                    {duration}
                  </motion.span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {career.position ? `${career.position} · ` : ""}{period}
                </p>
                {career.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {career.description}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
