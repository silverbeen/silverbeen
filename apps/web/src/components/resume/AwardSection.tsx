"use client";

import { ExternalLink, Trophy, Medal, Award as AwardIcon } from "lucide-react";
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

const extractPrize = (title: string) => {
  const prizePatterns = ["대상", "금상", "은상", "동상", "인기상", "장려상", "은메달", "금메달", "동메달"];
  for (const prize of prizePatterns) {
    if (title.includes(prize)) {
      return prize;
    }
  }
  return null;
};

const getPrizeIcon = (prize: string | null) => {
  if (!prize) return AwardIcon;
  if (prize.includes("대상") || prize.includes("금")) return Trophy;
  if (prize.includes("은") || prize.includes("인기")) return Medal;
  return AwardIcon;
};

const getPrizeColor = (prize: string | null) => {
  if (!prize) return "text-primary";
  if (prize.includes("대상") || prize.includes("금")) return "text-yellow-500";
  if (prize.includes("은")) return "text-gray-400";
  if (prize.includes("인기")) return "text-pink-500";
  return "text-primary";
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
        {awards.map((award) => {
          const prize = extractPrize(award.title);
          const Icon = getPrizeIcon(prize);
          const iconColor = getPrizeColor(prize);

          return (
            <motion.div
              key={`${award.date}-${award.title}`}
              className="flex items-start gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-background to-primary/5 p-4 transition-colors hover:border-primary/30"
              variants={itemVariants}
            >
              <div className={`rounded-full bg-background p-2 shadow-sm ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{award.title}</h3>
                    {prize && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {prize}
                      </span>
                    )}
                    {award.link && (
                      <a
                        href={award.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {award.date}
                  </span>
                </div>
                {award.description && (
                  <p className="mt-1 text-sm text-foreground/70">
                    {award.description}
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
