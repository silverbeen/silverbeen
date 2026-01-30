'use client';

import { Mail, Github, BookOpen, Linkedin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants, imageVariants } from './constants';
import type { Profile } from '@/types/portfolio';

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
      className="relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-8">
        {/* 프로필 이미지 */}
        {profile.photo && (
          <motion.div className="group relative mx-auto shrink-0 md:mx-0" variants={imageVariants}>
            <div className="relative h-36 w-36 overflow-hidden rounded-3xl md:h-44 md:w-44">
              <ImageComponent
                src={profile.photo}
                alt={profile.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              {/* 미묘한 오버레이 */}
              <div className="from-primary/10 absolute inset-0 bg-gradient-to-tr via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </motion.div>
        )}

        {/* 정보 영역 */}
        <div className="flex flex-1 flex-col gap-5 text-center md:text-left">
          {/* 이름 & 타이틀 */}
          <motion.div variants={itemVariants} className="space-y-1">
            <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
              {profile.name}
            </h1>
            {profile.title && (
              <p className="text-primary/90 text-base font-medium">{profile.title}</p>
            )}
          </motion.div>

          {/* 태그라인 */}
          {profile.tagline && (
            <motion.p
              className="text-foreground/70 text-[15px] leading-relaxed"
              variants={itemVariants}
            >
              {profile.tagline}
            </motion.p>
          )}

          {/* 연락처 링크 */}
          <motion.div
            className="flex flex-wrap justify-center gap-2.5 md:justify-start"
            variants={itemVariants}
          >
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="group/link border-primary/20 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10 hover:shadow-primary/10 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-sm"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </a>
            )}
            {[
              { name: 'GitHub', href: profile.github, Icon: Github },
              { name: 'Blog', href: profile.blog, Icon: BookOpen },
              { name: 'LinkedIn', href: profile.linkedin, Icon: Linkedin },
            ]
              .filter((link) => link.href)
              .map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link border-border/60 bg-background text-foreground/70 hover:border-foreground/20 hover:bg-foreground/5 hover:text-foreground flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-sm"
                >
                  <Icon className="h-4 w-4 transition-transform duration-200 group-hover/link:scale-110" />
                  <span>{name}</span>
                  <ExternalLink className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-60" />
                </a>
              ))}
          </motion.div>
        </div>
      </div>

      {/* 소개글 */}
      {profile.introduction && (
        <motion.div
          className="border-border/50 from-muted/30 to-muted/10 mt-8 rounded-2xl border bg-gradient-to-br p-6"
          variants={itemVariants}
        >
          <div className="text-foreground/75 space-y-3 text-[15px] leading-[1.8]">
            {profile.introduction.split('\n').map((paragraph, idx) => (
              <p key={`intro-${idx}`}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
