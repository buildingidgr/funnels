import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { Info, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  showIllustration?: boolean;
  title?: string;
  description?: string;
}

export default function FunnelAnalysisLoading({ showIllustration = false, title, description }: Props) {
  return (
    <div className="space-y-6">
      {/* Sticky top bar matching analysis page header */}
      <div className="sticky top-0 z-40 pl-4 pr-4 flex items-center justify-between bg-gray-50/90 backdrop-blur supports-[backdrop-filter]:bg-gray-50/70 py-3 border-b dark:bg-neutral-900/70 dark:supports-[backdrop-filter]:bg-neutral-900/60">
        <div>
          <Skeleton className="mb-2 h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-44" />
        </div>
      </div>

      {/* Explanatory banner */}
      <div className="px-4" aria-live="polite" aria-busy="true">
        <div className="mb-2 rounded-2xl border border-blue-200/70 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-blue-900 shadow-sm dark:border-blue-900/40 dark:from-blue-950/30 dark:to-indigo-950/20 dark:text-blue-100">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blue-600/10 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
              <Info className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-6 md:text-xl">
                {title || 'Preparing your funnel analysis'}
              </h3>
              <p className="mt-1 text-sm leading-6 text-blue-800/90 dark:text-blue-100/90 md:text-base">
                {description || 'We are fetching your funnel configuration, recalculating step metrics, and preparing the visualization. This simulates a short remote API delay for a realistic experience.'}
              </p>
              <div className="mt-3 grid gap-2 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  <span>Fetching funnel data</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  <span>Recomputing visitor counts and conversion rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  <span>Generating Sankey and step-flow visuals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs/controls placeholder */}
      <div className="px-4">
        <div className="mb-3 flex items-center gap-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="ml-auto h-9 w-40" />
        </div>

        {/* Visualization card placeholder matching single-column visualization */}
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>

          {/* Small inline hint */}
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-gray-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Rendering charts and computing flows… This usually takes 1–3 seconds.</span>
          </div>

          {/* Center illustration within the main visualization area */}
          {showIllustration && (
            <div className="my-6 flex w-full items-center justify-center">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="/placeholder.png"
                  alt="Illustration"
                  className="h-[320px] w-auto opacity-90 dark:opacity-80 md:h-[360px]"
                />
              </div>
            </div>
          )}

          {/* Sankey/funnel bars approximation */}
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-11/12" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-9/12" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-7/12" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-5/12" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-4/12" />
            </div>
          </div>

          {/* Legend/metrics area */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      </div>

      {/* removed bottom illustration block; illustration now appears centrally within the card */}
    </div>
  );
}


