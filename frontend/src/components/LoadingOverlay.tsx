"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";

/**
 * Full-page loading overlay displayed during AI import processing.
 * Prevents background interaction and shows animated progress.
 */
export function LoadingOverlay(): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 shadow-2xl shadow-primary/5">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-10 text-primary" />
          </div>
          <Loader2 className="absolute -top-2 -right-2 size-8 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Processing with AI
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Mapping and extracting your leads using Groq AI...
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            This may take a moment depending on the file size.
          </p>
        </div>
        <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}
