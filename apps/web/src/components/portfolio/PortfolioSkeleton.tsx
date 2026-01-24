'use client';

export function PortfolioSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-col gap-12">
          {/* Profile Skeleton */}
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <div className="flex flex-1 flex-col gap-4">
              <div className="h-12 w-3/4 animate-pulse rounded-lg bg-muted" />
              <div className="h-6 w-1/2 animate-pulse rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-56 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="h-32 w-32 shrink-0 animate-pulse rounded-full bg-muted sm:h-40 sm:w-40" />
          </div>

          <hr className="border-border" />

          {/* Clubs Skeleton */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={`club-skeleton-${i}`}
                  className="h-32 animate-pulse rounded-xl border border-border bg-muted"
                />
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Projects Skeleton */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="mb-6 flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`filter-skeleton-${i}`}
                  className="h-10 w-20 animate-pulse rounded-full bg-muted"
                />
              ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={`project-skeleton-${i}`}
                  className="h-64 animate-pulse rounded-xl border border-border bg-muted"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
