'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Github, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Profile } from '@/types/resume';

// 타이핑 효과 컴포넌트
function TypingEffect({ text, className }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState('');
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
    setDisplayedText('');
    setIsPlaying(true);
  };

  // 마침표: 메인 컬러, 강은빈: 물결 밑줄
  const renderStyledText = (text: string) => {
    const targetName = '강은빈';
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      if (text.slice(currentIndex).startsWith(targetName)) {
        // TODO: 물결 밑줄 스타일 (disabled)
        // style={{
        //   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 70 12'%3E%3Cpath d='M0 6 Q8 2, 17 6 T35 6 T52 6 T70 6' stroke='%23514EF6' stroke-width='4.5' fill='none' stroke-linecap='round' opacity='0.7'/%3E%3Cpath d='M2 6.5 Q10 3, 19 6.5 T37 6.5 T54 6.5 T70 6.5' stroke='%23514EF6' stroke-width='2' fill='none' stroke-linecap='round' opacity='0.4'/%3E%3Cpath d='M0 5.5 Q9 2.5, 18 5.5 T36 5.5 T53 5.5 T70 5.5' stroke='%23514EF6' stroke-width='1' fill='none' stroke-linecap='round' opacity='0.25'/%3E%3C/svg%3E")`,
        //   backgroundRepeat: 'repeat-x',
        //   backgroundPosition: 'bottom',
        //   backgroundSize: '70px 12px',
        //   paddingBottom: '9px',
        // }}
        parts.push(<span key={currentIndex}>{targetName}</span>);
        currentIndex += targetName.length;
      } else {
        const char = text[currentIndex];
        if (char === '.') {
          parts.push(
            <span key={currentIndex} className="text-primary">
              {char}
            </span>
          );
        } else {
          parts.push(<span key={currentIndex}>{char}</span>);
        }
        currentIndex++;
      }
    }

    return parts;
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
      {renderStyledText(displayedText)}
      {!isComplete && (
        <motion.span
          className="bg-primary ml-1 inline-block h-[1em] w-1 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
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
      ease: 'easeOut' as const,
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
      ease: 'easeOut' as const,
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
  return <img src={src} alt={alt} className={`${className || ''} h-full w-full object-cover`} />;
}

export function ProfileSection({ profile, ImageComponent = DefaultImage }: ProfileSectionProps) {
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
              className="text-foreground text-[50px] font-bold"
            />
          )}
          {profile.tagline && (
            <motion.p className="text-foreground/90 text-lg font-medium" variants={itemVariants}>
              {profile.tagline}
            </motion.p>
          )}
        </div>

        {profile.introduction && (
          <motion.div
            className="text-foreground/70 max-w-2xl space-y-3 text-[15px] leading-relaxed"
            variants={itemVariants}
          >
            {profile.introduction.split('\n\n').map((paragraph, idx) => (
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
              className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Phone className="h-4 w-4" />
              <span>{profile.phone}</span>
            </motion.a>
          )}
          <motion.a
            href={`mailto:${profile.email}`}
            className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 transition-colors"
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
            className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 transition-colors"
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
            className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 transition-colors"
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
          className="bg-muted relative h-52 w-40 shrink-0 overflow-hidden rounded-lg sm:h-64 sm:w-48"
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
