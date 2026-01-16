"use client";

import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import type { Education } from "@/types/resume";
import { SectionTitle } from "./SectionTitle";

interface EducationSectionProps {
  education: Education[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section id="education">
      <SectionTitle>학력</SectionTitle>
      <motion.div
        className="flex flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {education.map((edu) => (
          <motion.div
            key={`${edu.school}-${edu.major}-${edu.period}`}
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
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
            </motion.div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                {edu.school}
              </h3>
              <p className="text-sm text-muted-foreground">
                {edu.major} · {edu.period}
              </p>
              {edu.description && (
                <p className="mt-1 text-sm text-muted-foreground/80">
                  {edu.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
