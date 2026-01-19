const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`rounded bg-gray-200 dark:bg-gray-700 ${className}`} />
);

const CONTENT_LINE_WIDTHS = ['w-full', 'w-full', 'w-5/6', 'w-full', 'w-4/5', 'w-full', 'w-3/4'];

export default function BlogDetailLoading() {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <article className="animate-pulse" aria-busy="true">
          {/* Tags skeleton */}
          <div className="mb-4 flex gap-2">
            <SkeletonBlock className="h-6 w-16 rounded-full" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>

          {/* Title skeleton */}
          <div className="mb-4 space-y-2">
            <SkeletonBlock className="h-10 w-3/4" />
            <SkeletonBlock className="h-10 w-1/2" />
          </div>

          {/* Meta info skeleton */}
          <div className="mb-8 flex gap-4">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-5 w-16" />
          </div>

          {/* Cover image skeleton */}
          <SkeletonBlock className="mb-8 aspect-video rounded-xl" />

          {/* Content skeleton */}
          <div className="space-y-4">
            {CONTENT_LINE_WIDTHS.map((width, index) => (
              <SkeletonBlock key={index} className={`h-4 ${width}`} />
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
