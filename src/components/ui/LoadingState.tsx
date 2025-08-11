import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  className?: string;
  showIllustration?: boolean;
  illustrationAlt?: string;
  // Allows passing a custom domain skeleton (e.g., funnel skeleton)
  children?: React.ReactNode;
}

export function LoadingState({
  title = "Loading...",
  subtitle = "Fetching data from the server. This may take a few seconds.",
  className,
  showIllustration = true,
  illustrationAlt = "Loading illustration",
  children,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "relative min-h-[60vh] w-full",
        "bg-gradient-to-b from-white to-gray-50 dark:from-neutral-950 dark:to-neutral-900",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
              </div>
            </div>

            {/* Indeterminate bar */}
            <div className="relative mb-8 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
              <div className="absolute left-0 top-0 h-full w-1/3 animate-[loading_1.2s_ease_infinite] rounded-full bg-primary/70" />
            </div>

            {/* Domain-specific skeletons */}
            <div className="space-y-4">
              {children ? (
                children
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                  <Skeleton className="h-64" />
                </>
              )}
            </div>
          </div>

          {showIllustration && (
            <div className="relative hidden items-center justify-center lg:flex">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 blur-2xl" />
              <div className="relative">
                <img
                  src="/placeholder.svg"
                  alt={illustrationAlt}
                  className="h-auto w-[520px] opacity-90 dark:opacity-80"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyframe for the indeterminate bar */}
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(30%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function FunnelLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      {/* Chart area */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 grid grid-cols-4 gap-4">
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
            </div>
            <Skeleton className="h-[360px] w-full" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
    </div>
  );
}

export default LoadingState;


