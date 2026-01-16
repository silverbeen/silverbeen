"use client";

import { ExternalLink, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { Award } from "@/types/resume";
import { SectionTitle } from "./SectionTitle";

interface AwardSectionProps {
  awards: Award[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function AwardSection({ awards }: AwardSectionProps) {
  return (
    <section id="awards">
      <SectionTitle>수상 및 기타</SectionTitle>
      <motion.div
        className="flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {awards.map((award) => (
          <motion.div
            key={`${award.date}-${award.title}`}
            className="group flex gap-4 rounded-lg border border-primary/20 bg-card p-4"
            variants={itemVariants}
            whileHover={{ x: 4, borderColor: "var(--primary)" }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent"
              whileHover={{ scale: 1.1, rotate: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Trophy className="h-5 w-5 text-accent-foreground" />
            </motion.div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {award.date}
                </span>
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {award.title}
                </h3>
                {award.link && (
                  <motion.a
                    href={award.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    whileHover={{ scale: 1.05 }}
                  >
                    {award.linkLabel || "링크"}
                    <ExternalLink className="h-3 w-3" />
                  </motion.a>
                )}
              </div>
              {award.description && (
                <p className="text-sm text-muted-foreground">
                  {award.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
