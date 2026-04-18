import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        "dark:before:via-white/[0.06]",
        className
      )}
      {...props}
    />
  );
}

/* ── Page-level skeleton presets ─────────────────────── */

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-zinc-200/50 p-5 dark:border-zinc-800/50">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-2 w-16" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200/50 p-4 dark:border-zinc-800/50">
            <Skeleton className="mb-4 h-4 w-32" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Category grid */}
      <div className="rounded-xl border border-zinc-200/50 p-4 dark:border-zinc-800/50">
        <Skeleton className="mb-4 h-4 w-36" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-zinc-200/50 p-4 dark:border-zinc-800/50">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl border border-zinc-200/50 p-4 dark:border-zinc-800/50">
        <Skeleton className="mb-4 h-4 w-40" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-md p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-zinc-200/50 p-5 dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-2 w-20" />
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="rounded-2xl border border-zinc-200/50 p-5 dark:border-zinc-800/50">
        <Skeleton className="mb-4 h-4 w-40" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>

      {/* Category comparison */}
      <div className="rounded-2xl border border-zinc-200/50 p-5 dark:border-zinc-800/50">
        <Skeleton className="mb-4 h-4 w-44" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-zinc-200/50 p-5 dark:border-zinc-800/50">
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl p-3">
              <Skeleton className="h-5 w-5 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BudgetsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-52" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Overview bar */}
      <div className="rounded-2xl border border-zinc-200/50 p-6 dark:border-zinc-800/50">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Budget cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-zinc-200/50 p-5 dark:border-zinc-800/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GoalsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Overview bar */}
      <div className="rounded-2xl border border-zinc-200/50 p-6 dark:border-zinc-800/50">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Goal cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-zinc-200/50 p-5 dark:border-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryTableSkeleton() {
  return (
    <div className="space-y-1">
      {/* Table header */}
      <div className="grid grid-cols-6 gap-4 border-b border-zinc-200 p-2 dark:border-zinc-800">
        {["w-16", "w-20", "w-24", "w-14", "w-16", "w-20"].map((w, i) => (
          <Skeleton key={i} className={`h-3 ${w}`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4 border-b border-zinc-100 p-2 dark:border-zinc-800/50">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-14 rounded-full" />
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-14 rounded-md" />
            <Skeleton className="h-7 w-14 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
