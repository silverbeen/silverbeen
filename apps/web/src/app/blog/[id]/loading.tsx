export default function BlogDetailLoading() {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <article className="animate-pulse">
          {/* Tags skeleton */}
          <div className="mb-4 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Title skeleton */}
          <div className="mb-4 space-y-2">
            <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Meta info skeleton */}
          <div className="mb-8 flex gap-4">
            <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Cover image skeleton */}
          <div className="mb-8 aspect-video rounded-xl bg-gray-200 dark:bg-gray-700" />

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </article>
      </div>
    </div>
  );
}
