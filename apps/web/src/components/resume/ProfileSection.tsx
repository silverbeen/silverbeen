'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Github, BookOpen, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Profile } from '@silverbeen/types';

// 타이핑 효과 컴포넌트
function TypingEffect({
  text,
  highlight,
  className,
}: {
  text: string;
  /** 하나의 덩어리로 렌더링할 강조 텍스트 (예: 이름) */
  highlight?: string;
  className?: string;
}) {
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

  // 마침표: 메인 컬러, 강조 텍스트(이름): 하나의 span으로 유지
  const renderStyledText = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      if (highlight && text.slice(currentIndex).startsWith(highlight)) {
        parts.push(<span key={currentIndex}>{highlight}</span>);
        currentIndex += highlight.length;
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

export function ProfileSection({ profile }: ProfileSectionProps) {
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
              highlight={profile.name}
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
          {[
            { type: 'phone', value: profile.phone, Icon: Phone, href: `tel:${profile.phone}` },
            { type: 'email', value: profile.email, Icon: Mail, href: `mailto:${profile.email}` },
            { type: 'github', value: profile.github, Icon: Github, href: profile.github, isExternal: true },
            { type: 'blog', value: profile.blog, Icon: BookOpen, href: profile.blog, isExternal: true },
            { type: 'linkedin', value: profile.linkedin, Icon: Linkedin, href: profile.linkedin, isExternal: true },
          ]
            .filter((item) => item.value)
            .map((item) => (
              <motion.a
                key={item.type}
                href={item.href!}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 transition-colors"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <item.Icon className="h-4 w-4" />
                <span>{item.value}</span>
              </motion.a>
            ))}
        </motion.div>
      </motion.div>
      {profile.photo && (
        <motion.div
          className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border border-border sm:h-40 sm:w-40"
          variants={imageVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={profile.photo}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="160px"
            priority
          />
        </motion.div>
      )}
    </motion.section>
  );
}
