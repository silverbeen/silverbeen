"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Github, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { Profile } from "@/types/resume";

// 타이핑 효과 컴포넌트
function TypingEffect({ text, className }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const isComplete = displayedText.length >= text.length;

  useEffect(() => {
    if (!isPlaying) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, text, isPlaying]);

  const handleClick = () => {
    setDisplayedText("");
    setIsPlaying(true);
  };

  return (
    <motion.h1
      className={`${className} cursor-pointer select-none`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      title="클릭하여 다시 재생"
    >
      {displayedText}
      {!isComplete && (
        <motion.span
          className="inline-block w-1 h-[1em] bg-primary ml-1 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
      )}
    </motion.h1>
  );
}

interface ProfileSectionProps {
  profile: Profile;
  ImageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
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
  priority?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${className || ""} object-cover w-full h-full`}
    />
  );
}

export function ProfileSection({
  profile,
  ImageComponent = DefaultImage,
}: ProfileSectionProps) {
  return (
    <motion.section
      id="profile"
      className="flex flex-col gap-6 sm:flex-row sm:gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-1 flex-col gap-4" variants={itemVariants}>
        <div className="flex flex-col gap-2">
          {profile.greeting && (
            <TypingEffect
              text={profile.greeting}
              className="text-[50px] font-bold text-foreground"
            />
          )}
          {profile.tagline && (
            <motion.p
              className="text-lg font-medium text-foreground/90"
              variants={itemVariants}
            >
              {profile.tagline}
            </motion.p>
          )}
        </div>

        {profile.introduction && (
          <motion.div
            className="max-w-2xl space-y-3 text-[15px] leading-relaxed text-foreground/70"
            variants={itemVariants}
          >
            {profile.introduction.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </motion.div>
        )}

        <motion.div className="flex flex-col gap-2 text-sm" variants={itemVariants}>
          {profile.phone && (
            <motion.a
              href={`tel:${profile.phone}`}
              className="w-fit flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Phone className="h-4 w-4" />
              <span>{profile.phone}</span>
            </motion.a>
          )}
          <motion.a
            href={`mailto:${profile.email}`}
            className="w-fit flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <Mail className="h-4 w-4" />
            <span>{profile.email}</span>
          </motion.a>
          <motion.a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <Github className="h-4 w-4" />
            <span>{profile.github}</span>
          </motion.a>
          <motion.a
            href={profile.blog}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <BookOpen className="h-4 w-4" />
            <span>{profile.blog}</span>
          </motion.a>
        </motion.div>
      </motion.div>
      {profile.photo && (
        <motion.div
          className="relative h-40 w-32 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-48 sm:w-36"
          variants={imageVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <ImageComponent
            src={profile.photo}
            alt={profile.name}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      )}
    </motion.section>
  );
}
