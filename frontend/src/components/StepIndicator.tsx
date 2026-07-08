"use client";

import React from "react";
import { Check, Upload, Eye, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardStep } from "@/hooks/useCSVImporter";

interface StepConfig {
  key: WizardStep | "importing";
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { key: "upload", label: "Upload", icon: <Upload className="size-4" /> },
  { key: "preview", label: "Preview", icon: <Eye className="size-4" /> },
  { key: "results", label: "Results", icon: <BarChart3 className="size-4" /> },
];

interface StepIndicatorProps {
  currentStep: WizardStep;
}

/**
 * Horizontal step indicator showing the wizard progress.
 * Active step: emerald accent. Completed steps: checkmark icon.
 */
export function StepIndicator({
  currentStep,
}: StepIndicatorProps): React.JSX.Element {
  const stepOrder: WizardStep[] = ["upload", "preview", "results"];
  const currentIndex: number = stepOrder.indexOf(
    currentStep === "importing" ? "preview" : currentStep
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, index) => {
        const isCompleted: boolean = index < currentIndex;
        const isActive: boolean =
          index === currentIndex ||
          (currentStep === "importing" && step.key === "preview");

        return (
          <React.Fragment key={step.key}>
            {index > 0 && (
              <div
                className={cn(
                  "h-px w-8 sm:w-16 transition-colors duration-300",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  isActive &&
                    !isCompleted &&
                    "border-primary bg-primary/10 text-primary animate-pulse",
                  !isCompleted &&
                    !isActive &&
                    "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline transition-colors duration-300",
                  isActive && "text-primary",
                  isCompleted && "text-foreground",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
