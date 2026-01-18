"use client";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

function ProfileSkeleton() {
  return (
    <section className="flex flex-col items-center gap-6 md:flex-row md:items-start">
      {/* Profile Image */}
      <SkeletonPulse className="h-40 w-40 shrink-0 rounded-full" />

      <div className="flex flex-1 flex-col gap-4 text-center md:text-left">
        {/* Name */}
        <SkeletonPulse className="mx-auto h-10 w-48 md:mx-0" />
        {/* Title/Tagline */}
        <SkeletonPulse className="mx-auto h-6 w-64 md:mx-0" />
        {/* Introduction */}
        <div className="space-y-2">
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-3/4" />
        </div>
        {/* Contact Links */}
        <div className="flex justify-center gap-3 md:justify-start">
          <SkeletonPulse className="h-8 w-8 rounded-full" />
          <SkeletonPulse className="h-8 w-8 rounded-full" />
          <SkeletonPulse className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </section>
  );
}

function SkillsSkeleton() {
  return (
    <section className="space-y-6">
      <SkeletonPulse className="h-8 w-32" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonPulse className="h-5 w-24" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <SkeletonPulse key={j} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExperienceSkeleton() {
  return (
    <section className="space-y-6">
      <SkeletonPulse className="h-8 w-32" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-lg border p-6">
          {/* Company Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SkeletonPulse className="h-6 w-40" />
              <SkeletonPulse className="h-4 w-32" />
            </div>
            <SkeletonPulse className="h-4 w-28" />
          </div>
          {/* Description */}
          <SkeletonPulse className="h-4 w-full" />
          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <SkeletonPulse key={j} className="h-6 w-20 rounded-full" />
            ))}
          </div>
          {/* Projects */}
          <div className="space-y-3 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <SkeletonPulse className="h-5 w-48" />
                <SkeletonPulse className="h-4 w-full" />
                <SkeletonPulse className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function EducationSkeleton() {
  return (
    <section className="space-y-6">
      <SkeletonPulse className="h-8 w-32" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-start justify-between">
          <div className="space-y-2">
            <SkeletonPulse className="h-5 w-48" />
            <SkeletonPulse className="h-4 w-32" />
          </div>
          <SkeletonPulse className="h-4 w-28" />
        </div>
      ))}
    </section>
  );
}

function CertificationSkeleton() {
  return (
    <section className="space-y-6">
      <SkeletonPulse className="h-8 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <SkeletonPulse className="h-5 w-40" />
            <SkeletonPulse className="h-4 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}

function AwardSkeleton() {
  return (
    <section className="space-y-6">
      <SkeletonPulse className="h-8 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <SkeletonPulse className="h-5 w-48" />
              <SkeletonPulse className="h-4 w-24" />
            </div>
            <SkeletonPulse className="h-4 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ResumeSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-col gap-12">
          <ProfileSkeleton />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <SkillsSkeleton />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <ExperienceSkeleton />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <EducationSkeleton />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <CertificationSkeleton />

          <hr className="border-sky-100 dark:border-sky-900/30" />

          <AwardSkeleton />
        </div>
      </main>
    </div>
  );
}
