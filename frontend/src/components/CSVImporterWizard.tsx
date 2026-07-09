"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useCSVImporter } from "@/hooks/useCSVImporter";
import { StepIndicator } from "@/components/StepIndicator";
import { FileUpload } from "@/components/FileUpload";
import { CSVPreviewTable } from "@/components/CSVPreviewTable";
import { ParsedResults } from "@/components/ParsedResults";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Main wizard component for the GrowEasy AI-Powered CSV Importer.
 * Orchestrates a multi-step wizard: Upload → Preview → Results.
 */
export function CSVImporterWizard(): React.JSX.Element {
  const {
    step,
    rawRecords,
    headers,
    importResult,
    importProgress,
    isUploading,
    error,
    handleUpload,
    handleConfirmImport,
    handleReset,
  } = useCSVImporter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Loading overlay during AI processing */}
      {step === "importing" && <LoadingOverlay progress={importProgress} />}

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">GrowEasy</h1>
              <p className="text-xs text-muted-foreground">
                AI-Powered CSV Importer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StepIndicator currentStep={step} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
        {/* Step title */}
        <div className="mb-8 text-center">
          {step === "upload" && (
            <>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Import Your Leads
              </h2>
              <p className="mt-2 text-muted-foreground">
                Upload a CSV file from any source — Facebook, Google Ads, or
                your CRM.
              </p>
            </>
          )}
          {step === "preview" && (
            <>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Review Your Data
              </h2>
              <p className="mt-2 text-muted-foreground">
                Verify the parsed CSV content below, then confirm to start AI
                extraction.
              </p>
            </>
          )}
          {step === "importing" && (
            <>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Processing...
              </h2>
              <p className="mt-2 text-muted-foreground">
                AI is mapping your data to the GrowEasy CRM format.
              </p>
            </>
          )}
          {step === "results" && (
            <>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Import Complete
              </h2>
              <p className="mt-2 text-muted-foreground">
                Your leads have been processed and saved to the database.
              </p>
            </>
          )}
        </div>

        {/* Step content */}
        <div className="flex-1">
          {step === "upload" && (
            <FileUpload
              onUpload={handleUpload}
              isUploading={isUploading}
              error={error}
            />
          )}

          {step === "preview" && (
            <CSVPreviewTable
              records={rawRecords}
              headers={headers}
              onConfirmImport={handleConfirmImport}
              onUploadAnother={handleReset}
            />
          )}

          {step === "results" && importResult && (
            <ParsedResults result={importResult} onReset={handleReset} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          GrowEasy CSV Importer · Powered by Groq AI
        </p>
      </footer>
    </div>
  );
}
