export function BlogPostArticleSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse px-16 py-32">
      <div className="flex flex-col gap-6">
        <div className="h-10 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
