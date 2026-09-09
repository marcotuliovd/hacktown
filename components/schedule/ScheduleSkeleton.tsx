import { cn } from "@/lib/cn";

export function ScheduleSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando programação" className="px-4">
      <div className="mb-6 h-8 w-48 animate-pulse bg-bg-surface" />
      <div className="mb-8 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 w-14 shrink-0 animate-pulse bg-bg-surface"
          />
        ))}
      </div>
      <div className="flex flex-col gap-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn("flex gap-4 border-b border-subtle py-3")}
          >
            <div className="h-4 w-24 animate-pulse bg-bg-surface" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-5 w-3/4 animate-pulse bg-bg-surface" />
              <div className="h-3 w-1/2 animate-pulse bg-bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando evento"
      className="flex min-h-dvh flex-col"
    >
      <div className="aspect-[16/10] w-full animate-pulse bg-bg-surface sm:aspect-[21/9]" />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        <div className="h-5 w-24 animate-pulse bg-bg-surface" />
        <div className="h-12 w-full animate-pulse bg-bg-surface" />
        <div className="h-4 w-40 animate-pulse bg-bg-surface" />
        <div className="h-24 w-full animate-pulse bg-bg-surface" />
      </div>
    </div>
  );
}
