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
    <section id="certifications">
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
            className="flex items-center gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-background to-primary/5 p-4 transition-colors hover:border-primary/30"
            variants={itemVariants}
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
