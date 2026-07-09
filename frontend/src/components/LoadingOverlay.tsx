"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { ImportProgress } from "@/types/interface";

interface LoadingOverlayProps {
  progress?: ImportProgress | null;
}

/**
 * Full-page loading overlay displayed during AI import processing.
 * Prevents background interaction and shows animated progress.
 */
export function LoadingOverlay({ progress }: LoadingOverlayProps): React.JSX.Element {
  const percentage = progress ? progress.percentage : 0;
  const currentBatch = progress ? progress.currentBatch : 0;
  const totalBatches = progress ? progress.totalBatches : 0;
  const importedCount = progress ? progress.importedCount : 0;
  const skippedCount = progress ? progress.skippedCount : 0;
  const failedCount = progress ? progress.failedCount : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-primary/5 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
            <Sparkles className="size-8 text-primary" />
          </div>
          <Loader2 className="absolute -top-1 -right-1 size-6 animate-spin text-primary" />
        </div>
        <div className="text-center w-full">
          <h3 className="text-lg font-semibold text-foreground">
            Processing with AI
          </h3>
          {progress && totalBatches > 0 ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Processing batch {currentBatch} of {totalBatches} ({percentage}%)
              </p>
              
              {/* Metric grid */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono text-center">
                <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
                  <div className="text-base font-bold">{importedCount}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Imported</div>
                </div>
                <div className="bg-amber-500/10 text-amber-400 p-2 rounded-lg border border-amber-500/20">
                  <div className="text-base font-bold">{skippedCount}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Skipped</div>
                </div>
                <div className="bg-red-500/10 text-red-400 p-2 rounded-lg border border-red-500/20">
                  <div className="text-base font-bold">{failedCount}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Failed</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Mapping and extracting your leads using Groq AI...
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60 animate-pulse">
                This may take a moment depending on the file size.
              </p>
            </>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          {progress && totalBatches > 0 ? (
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          ) : (
            <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%" }} />
          )}
        </div>
      </div>
    </div>
  );
}
