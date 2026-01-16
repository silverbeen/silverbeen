"use client";

import { motion } from "framer-motion";
import type { Skills } from "@/types/resume";
import { SectionTitle } from "./SectionTitle";

interface SkillsSectionProps {
  skills: Skills;
}

const skillLabels: Record<string, string> = {
  languages: "Core",
  stateManagement: "상태 관리",
  libraries: "모노레포 & 라이브러리",
  tools: "개발 도구 & CI/CD",
  collaboration: "협업",
  integrations: "연동",
  infrastructure: "인프라",
  testing: "테스트",
};

const skillOrder: (keyof typeof skillLabels)[] = [
  "languages",
  "stateManagement",
  "libraries",
  "tools",
  "collaboration",
  "integrations",
  "infrastructure",
  "testing",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section>
      <SectionTitle>보유 기술</SectionTitle>
      <motion.div
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {skillOrder.map((key) => {
          const items = skills[key as keyof Skills];
          if (!items || items.length === 0) return null;
          return (
            <motion.div
              key={key}
              className="flex flex-col gap-1 sm:flex-row sm:gap-3"
              variants={rowVariants}
            >
              <span className="min-w-28 shrink-0 text-sm font-medium text-foreground">
                {skillLabels[key]}
              </span>
              <motion.div
                className="flex flex-wrap gap-1.5"
                variants={containerVariants}
              >
                {items.map((skill, index) => (
                  <motion.span
                    key={skill}
                    className="rounded-md bg-accent px-2 py-0.5 text-sm text-accent-foreground"
                    variants={badgeVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.03,
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
