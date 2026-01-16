"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { Experience } from "@/types/resume";
import { SectionTitle } from "./SectionTitle";
import { ImageModal } from "./ImageModal";
import { calculateDuration, formatPeriod } from "@/utils/date";

interface ExperienceSectionProps {
  experience: Experience[];
  ImageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const projectVariants = {
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

function DefaultImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${className || ""} object-cover w-full h-full`}
    />
  );
}

export function ExperienceSection({
  experience,
  ImageComponent = DefaultImage,
}: ExperienceSectionProps) {
  return (
    <section id="experience">
      <SectionTitle>경력</SectionTitle>
      <motion.div
        className="flex flex-col gap-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {experience.map((exp) => {
          const companySlug = exp.company.replace(/[^a-zA-Z0-9가-힣]/g, "-").toLowerCase();
          const companyKey = `${companySlug}-${exp.startDate}`;
          const companyId = `company-${companyKey}`;
          return (
            <div key={companyKey} id={companyId}>
              <ExperienceCard
                experience={exp}
                companyKey={companyKey}
                ImageComponent={ImageComponent}
              />
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}

function ExperienceCard({
  experience,
  companyKey,
  ImageComponent = DefaultImage,
}: {
  experience: Experience;
  companyKey: string;
  ImageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
  }>;
}) {
  const duration = calculateDuration(experience.startDate, experience.endDate);
  const period = formatPeriod(experience.startDate, experience.endDate);

  return (
    <motion.div className="flex flex-col gap-6" variants={cardVariants}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold text-foreground">
            {experience.company}
          </h3>
          <motion.span
            className="rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground"
            whileHover={{ scale: 1.05 }}
          >
            {duration}
          </motion.span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{period}</span>
          {experience.description && (
            <>
              <span>·</span>
              <span>{experience.description}</span>
            </>
          )}
        </div>
      </div>

      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-sm font-semibold text-foreground">기술 스택</h4>
        <div className="flex flex-col gap-1.5">
          {experience.techStack.map((stack, index) => (
            <motion.div
              key={stack.category}
              className="flex gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="min-w-20 shrink-0 text-muted-foreground">
                {stack.category}
              </span>
              <span className="text-foreground">{stack.items.join(", ")}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-col gap-6">
        <h4 className="text-sm font-semibold text-foreground">프로젝트</h4>
        {experience.projects.map((project, index) => {
          const projectSlug = project.name.replace(/[^a-zA-Z0-9가-힣]/g, "-").toLowerCase();
          const projectId = `project-${companyKey}-${projectSlug}`;
          return (
            <motion.div
              key={project.name}
              id={projectId}
              variants={projectVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
            >
              <ProjectCard project={project} ImageComponent={ImageComponent} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ProjectCard({
  project,
  ImageComponent = DefaultImage,
}: {
  project: Experience["projects"][number];
  ImageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
  }>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const goToPrev = () => {
    if (!project.images) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? project.images!.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    if (!project.images) return;
    setCurrentImageIndex((prev) =>
      prev === project.images!.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-6 transition-colors duration-300 hover:border-primary/40"
    >
      {/* 배경 그라데이션 효과 */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:bg-primary/20" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />

      {/* 프로젝트 헤더 */}
      <div className="relative mb-6 border-b border-primary/10 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <h5 className="text-xl font-bold tracking-tight text-foreground">
              {project.name}
            </h5>
            {project.period && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/80">
                <span className="h-1 w-1 rounded-full bg-primary/60" />
                {project.period}
              </span>
            )}
          </div>
          <div className="flex w-fit flex-wrap gap-2">
            {project.links?.map((link) => (
              <motion.a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
                <ExternalLink className="h-3 w-3" />
              </motion.a>
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {project.description}
        </p>
        <div className="mt-3">
          <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary/15 to-primary/5 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-primary/20">
            {project.role}
          </span>
        </div>
        {project.techStack && project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.map((tech, index) => {
              const techName = typeof tech === "string" ? tech : tech.items.join(", ");
              const techKey = typeof tech === "string" ? tech : `${tech.category}-${index}`;
              return (
                <motion.span
                  key={techKey}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-2.5 py-1 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:text-primary"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  {techName}
                </motion.span>
              );
            })}
          </div>
        )}
      </div>

      {/* 주요 업무 */}
      <div className="relative flex flex-col gap-6">
        {project.tasks.map((task) => (
          <div key={task.title}>
            <h6 className="mb-3 flex items-center gap-2.5 text-sm font-bold text-foreground">
              <motion.span
                className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 shadow-sm shadow-primary/30"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </motion.span>
              {task.title}
            </h6>
            <ul className="ml-7 flex flex-col gap-2 border-l-2 border-primary/20 pl-3.5">
              {task.items.map((item, idx) => (
                <motion.li
                  key={idx}
                  className="relative text-sm leading-relaxed text-muted-foreground before:absolute before:-left-[1.125rem] before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/40"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.03 }}
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Impact 섹션 */}
      {project.impact && project.impact.length > 0 && (
        <motion.div
          className="relative mt-6 overflow-hidden rounded-xl bg-gradient-to-r from-primary/15 via-primary/10 to-transparent p-5 ring-1 ring-primary/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          <h6 className="relative mb-3 flex items-center gap-2 text-sm font-bold text-primary">
            <motion.svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </motion.svg>
            Impact
          </h6>
          <ul className="relative flex flex-col gap-2">
            {project.impact.map((item, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-2.5 text-sm font-medium text-foreground"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-sm shadow-primary/30" />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* 이미지 갤러리 */}
      {project.images && project.images.length > 0 && (
        <motion.div
          className="relative mt-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h6 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-sky-400 shadow-sm shadow-sky-500/30">
              <svg
                className="h-3 w-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
            Screenshots
          </h6>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {project.images.map((image, idx) => (
              <motion.button
                key={idx}
                className="group/image relative aspect-video overflow-hidden rounded-lg border border-border bg-muted cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => openModal(idx)}
              >
                <ImageComponent
                  src={image}
                  alt={`${project.name} screenshot ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/image:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/image:bg-black/20">
                  <svg
                    className="h-8 w-8 text-white opacity-0 transition-opacity group-hover/image:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 이미지 모달 */}
      {project.images && project.images.length > 0 && (
        <ImageModal
          images={project.images}
          currentIndex={currentImageIndex}
          isOpen={modalOpen}
          onClose={closeModal}
          onPrev={goToPrev}
          onNext={goToNext}
          projectName={project.name}
        />
      )}
    </motion.div>
  );
}
