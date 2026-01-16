"use client";

import { Award } from "lucide-react";
import { motion } from "framer-motion";
import type { Certification } from "@/types/resume";
import { SectionTitle } from "./SectionTitle";

interface CertificationSectionProps {
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export function CertificationSection({
  certifications,
}: CertificationSectionProps) {
  return (
    <section>
      <SectionTitle>자격증</SectionTitle>
      <motion.div
        className="flex flex-wrap gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {certifications.map((cert) => (
          <motion.div
            key={cert.name}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
            variants={itemVariants}
          >
            <Award className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">{cert.name}</p>
              <p className="text-xs text-muted-foreground">{cert.date}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
