"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, AlertCircle, Upload, Sparkles, Loader2, FileSpreadsheet, Clock, XCircle, RotateCw } from "lucide-react";
import { useCSVImporter } from "@/hooks/useCSVImporter";
import { FileUpload } from "@/components/FileUpload";
import { DataTable } from "@/components/DataTable";
import { ExportCSVButton } from "@/components/ExportCSVButton";
import { cn, formatISTDate } from "@/lib/utils";
import type { TargetLead, ImportProgress, ImportConfirmResponse, RawRecord, BatchInfo } from "@/types/interface";
import { StatusBadge } from "@/components/StatusBadge";
import { LeadDetailsDrawer } from "@/components/LeadDetailsDrawer";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportPreviewStepProps {
  fileName: string;
  fileSize: number;
  rawRecords: RawRecord[];
  previewColumns: { key: string; label: string }[];
  error: string | null;
  handleReset: () => void;
}

interface ImportingStepProps {
  importProgress: ImportProgress | null;
}

interface ImportResultsStepProps {
  importResult: ImportConfirmResponse;
  fileName: string;
  activeTab: "imported" | "skipped" | "failed";
  setActiveTab: (tab: "imported" | "skipped" | "failed") => void;
  onRowClick: (lead: TargetLead) => void;
}

/**
 * Sub-component for rendering the CSV preview step of the importer.
 */
function ImportPreviewStep({
  fileName,
  fileSize,
  rawRecords,
  previewColumns,
  error,
  handleReset,
}: ImportPreviewStepProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* erorr */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {/* File card */}
      {fileName && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileSpreadsheet className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {(fileSize / 1024).toFixed(1)} KB · {rawRecords.length} rows · {previewColumns.length} columns
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* CSV Preview Table */}
      <DataTable
        data={rawRecords}
        columns={previewColumns}
        maxHeight={340}
      />
    </div>
  );
}

/**
 * Returns the icon, label, and color classes for a given batch status.
 */
function getBatchStatusDisplay(batch: BatchInfo): {
  icon: React.ReactNode;
  label: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
} {
  switch (batch.status) {
    case "completed":
      return {
        icon: <CheckCircle2 className="size-3.5" />,
        label: "Completed",
        textClass: "text-emerald-400",
        bgClass: "bg-emerald-500/10",
        borderClass: "border-emerald-500/20",
      };
    case "processing":
      return {
        icon: <Loader2 className="size-3.5 animate-spin" />,
        label: "Processing",
        textClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/20",
      };
    case "retrying":
      return {
        icon: <RotateCw className="size-3.5 animate-spin" />,
        label: batch.retryAttempt && batch.retryMaxAttempts
          ? `Retrying ${batch.retryAttempt}/${batch.retryMaxAttempts - 1}`
          : "Retrying",
        textClass: "text-amber-400",
        bgClass: "bg-amber-500/10",
        borderClass: "border-amber-500/20",
      };
    case "failed":
      return {
        icon: <XCircle className="size-3.5" />,
        label: "Failed",
        textClass: "text-red-400",
        bgClass: "bg-red-500/10",
        borderClass: "border-red-500/20",
      };
    case "pending":
    default:
      return {
        icon: <Clock className="size-3.5 opacity-50" />,
        label: "Pending",
        textClass: "text-muted-foreground",
        bgClass: "bg-muted/30",
        borderClass: "border-border",
      };
  }
}

/**
 * Sub-component for rendering the progress indicator during AI import mapping.
 * Shows individual batch rows with live status badges.
 */
function ImportingStep({ importProgress }: ImportingStepProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6 min-h-[300px]">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 animate-pulse">
            <Sparkles className="size-7 text-primary" />
          </div>
          {(!importProgress || importProgress.totalBatches === 0) && (
            <Loader2 className="absolute -top-1 -right-1 size-5 animate-spin text-primary" />
          )}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Processing with AI
          </h3>
          {importProgress && importProgress.totalBatches > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {importProgress.percentage}% complete · Processing {importProgress.currentBatch} of {importProgress.totalBatches} batches
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground animate-pulse">
              Preparing batches...
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        {importProgress && importProgress.totalBatches > 0 ? (
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${importProgress.percentage}%` }}
          />
        ) : (
          <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "30%" }} />
        )}
      </div>

      {/* Batch Rows */}
      {importProgress && importProgress?.batchStatuses?.length > 0 && (
        <div className="flex flex-col gap-2">
          {importProgress.batchStatuses.map((batch, index) => {
            const display = getBatchStatusDisplay(batch);
            return (
              <div key={index}>
                <div
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-300",
                    display.bgClass,
                    display.borderClass,
                    batch.status === "processing" && "ring-1 ring-primary/30",
                    batch.status === "retrying" && "ring-1 ring-amber-500/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", display.bgClass)}>
                      <span className="text-xs font-bold text-foreground">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Batch {index + 1}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Rows {index * 15 + 1}–{Math.min((index + 1) * 15, importProgress.totalRows)}
                      </p>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-semibold", display.textClass)}>
                    {display.icon}
                    <span>{display.label}</span>
                  </div>
                </div>
                {/* Retry reason shown below the batch row */}
                {batch.status === "retrying" && batch.retryReason && (
                  <div className="mt-1 ml-4 mr-4 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-500 text-[11px]">
                    <span className="font-medium">Reason:</span> {batch.retryReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {importProgress && importProgress.totalBatches > 0 && (
        <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
          <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
            <div className="text-base font-bold">{importProgress.importedCount}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Imported</div>
          </div>
          <div className="bg-amber-500/10 text-amber-400 p-2 rounded-lg border border-amber-500/20">
            <div className="text-base font-bold">{importProgress.skippedCount}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Skipped</div>
          </div>
          <div className="bg-red-500/10 text-red-400 p-2 rounded-lg border border-red-500/20">
            <div className="text-base font-bold">{importProgress.failedCount}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Failed</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Sub-component for rendering the tabbed import results (Imported / Skipped / Failed).
 */
function ImportResultsStep({
  importResult,
  fileName,
  activeTab,
  setActiveTab,
  onRowClick,
}: ImportResultsStepProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Top Section: Uploaded File & Export Button */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/60 px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileSpreadsheet className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Uploaded File</p>
            <p className="truncate text-sm font-semibold text-foreground font-mono" title={fileName}>
              {fileName || "leads.csv"}
            </p>
          </div>
        </div>
        <ExportCSVButton
          data={
            activeTab === "imported"
              ? importResult.importedLeads
              : activeTab === "skipped"
                ? importResult.skippedLeads
                : importResult.failedLeads
          }
          filename={`${activeTab}_leads_${fileName || "export.csv"}`}
          className="shrink-0"
        />
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Import Complete
            </h3>
            <p className="text-xs text-muted-foreground">
              {importResult.totalProcessed} rows processed
            </p>
          </div>
        </div>
        {/* Clickable stat tiles */}
        <div className="grid grid-cols-4 gap-2">
          {/* Total — not filterable, just informational */}
          <div className="rounded-lg border border-border bg-card/50 p-2.5 text-center">
            <p className="text-xl font-bold text-foreground">
              {importResult.totalProcessed}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">
              Total
            </p>
          </div>
          {/* Imported */}
          <button
            type="button"
            onClick={() => setActiveTab("imported")}
            className={cn(
              "rounded-lg border p-2.5 text-center transition-all cursor-pointer",
              activeTab === "imported"
                ? "border-primary bg-primary/20 ring-2 ring-primary/30"
                : "border-primary/30 bg-primary/10 hover:bg-primary/20"
            )}
          >
            <p className="text-xl font-bold text-primary">{importResult.importedCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">Imported</p>
          </button>
          {/* Skipped */}
          <button
            type="button"
            onClick={() => setActiveTab("skipped")}
            className={cn(
              "rounded-lg border p-2.5 text-center transition-all cursor-pointer",
              activeTab === "skipped"
                ? "border-yellow-500 bg-yellow-500/20 ring-2 ring-yellow-500/30"
                : "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"
            )}
          >
            <p className="text-xl font-bold text-yellow-500">{importResult.skippedCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">Skipped</p>
          </button>
          {/* Failed */}
          <button
            type="button"
            onClick={() => setActiveTab("failed")}
            className={cn(
              "rounded-lg border p-2.5 text-center transition-all cursor-pointer",
              activeTab === "failed"
                ? "border-destructive bg-destructive/20 ring-2 ring-destructive/30"
                : "border-destructive/30 bg-destructive/10 hover:bg-destructive/20"
            )}
          >
            <p className="text-xl font-bold text-destructive">{importResult.failedCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">Failed</p>
          </button>
        </div>
      </div>

      {/* Filtered results table */}
      {activeTab === "imported" && (
        importResult?.importedLeads?.length > 0 ? (
          <DataTable
            data={importResult.importedLeads}
            columns={[
              { key: "created_at", label: "Created At", render: (row: TargetLead): React.ReactNode => formatISTDate(row.created_at) },
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "country_code", label: "Country Code" },
              { key: "mobile_without_country_code", label: "Mobile" },
              { key: "company", label: "Company" },
              { key: "city", label: "City" },
              { key: "state", label: "State" },
              { key: "country", label: "Country" },
              { key: "lead_owner", label: "Lead Owner" },
              { key: "crm_status", label: "Status", render: (row: TargetLead): React.ReactNode => <StatusBadge status={row.crm_status} /> },
              { key: "crm_note", label: "Notes/Remarks" },
              { key: "data_source", label: "Source" },
              { key: "possession_time", label: "Possession Time" },
              { key: "description", label: "Description" },
            ]}
            maxHeight={300}
            onRowClick={onRowClick}
          />
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No imported leads.</p>
        )
      )}

      {activeTab === "skipped" && (
        importResult?.skippedLeads?.length > 0 ? (
          <DataTable
            data={importResult.skippedLeads}
            columns={[
              { key: "created_at", label: "Created At", render: (row: TargetLead): React.ReactNode => formatISTDate(row.created_at) },
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "country_code", label: "Country Code" },
              { key: "mobile_without_country_code", label: "Mobile" },
              { key: "company", label: "Company" },
              { key: "city", label: "City" },
              { key: "state", label: "State" },
              { key: "country", label: "Country" },
              { key: "lead_owner", label: "Lead Owner" },
              { key: "crm_status", label: "Status", render: (row: TargetLead): React.ReactNode => <StatusBadge status={row.crm_status} /> },
              { key: "crm_note", label: "Notes/Remarks" },
              { key: "data_source", label: "Source" },
              { key: "possession_time", label: "Possession Time" },
              { key: "description", label: "Description" },
            ]}
            maxHeight={300}
            onRowClick={onRowClick}
          />
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No skipped leads.</p>
        )
      )}

      {activeTab === "failed" && (
        importResult?.failedLeads?.length > 0 ? (
          <DataTable
            data={importResult.failedLeads}
            columns={[
              { key: "created_at", label: "Created At", render: (row: TargetLead): React.ReactNode => formatISTDate(row.created_at) },
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "country_code", label: "Country Code" },
              { key: "mobile_without_country_code", label: "Mobile" },
              { key: "company", label: "Company" },
              { key: "city", label: "City" },
              { key: "state", label: "State" },
              { key: "country", label: "Country" },
              { key: "lead_owner", label: "Lead Owner" },
              { key: "crm_status", label: "Status", render: (row: TargetLead): React.ReactNode => <StatusBadge status={row.crm_status} /> },
              { key: "crm_note", label: "Reason/Error" },
              { key: "data_source", label: "Source" },
              { key: "possession_time", label: "Possession Time" },
              { key: "description", label: "Description" },
            ]}
            maxHeight={300}
            onRowClick={onRowClick}
          />
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No failed leads.</p>
        )
      )}
    </div>
  );
}

/**
 * Modal dialog for the CSV import wizard flow.
 * Contains: Upload → Preview → Importing → Results inside a modal overlay.
 */
export function ImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportModalProps): React.JSX.Element | null {
  const backdropRef = useRef<HTMLDivElement>(null);
  const {
    step,
    rawRecords,
    headers,
    fileName,
    fileSize,
    importResult,
    importProgress,
    isUploading,
    error,
    handleUpload,
    handleConfirmImport,
    handleReset,
    cancelImport,
  } = useCSVImporter();

  // Active tab for results filtering: "imported" | "skipped" | "failed"
  const [activeTab, setActiveTab] = useState<"imported" | "skipped" | "failed">("imported");

  const [selectedLead, setSelectedLead] = useState<TargetLead | null>(null);

  // Keep references to latest values to avoid re-subscribing in useEffect
  const onCloseRef = useRef(onClose);
  const handleResetRef = useRef(handleReset);
  const stepRef = useRef(step);
  const selectedLeadRef = useRef<TargetLead | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
    handleResetRef.current = handleReset;
    stepRef.current = step;
    selectedLeadRef.current = selectedLead;
  });

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && stepRef.current !== "importing" && !selectedLeadRef.current) {
        onCloseRef.current();
        handleResetRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return (): void => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return (): void => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === backdropRef.current && step !== "importing") {
      onClose();
      handleReset();
    }
  };

  const handleCloseAndRefresh = (): void => {
    onImportComplete();
    onClose();
    handleReset();
  };

  // Generate column definitions for CSV preview
  const previewColumns = headers.map((header) => ({
    key: header,
    label: header,
  }));

  return (
    <>
      <div
        ref={backdropRef}
        role="presentation"
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      >
        <div
          className={cn(
            "relative flex flex-col bg-card rounded-2xl shadow-2xl border border-border",
            "w-[95vw] max-w-4xl max-h-[90vh]",
            "animate-slide-up"
          )}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Import Leads via CSV
              </h2>
              <p className="text-sm text-muted-foreground">
                {step === "upload" &&
                  "Upload a CSV file to bulk import leads into your system."}
                {step === "preview" &&
                  `Preview: ${rawRecords.length} rows · ${headers.length} columns`}
                {step === "importing" &&
                  "AI is mapping your data to the GrowEasy CRM format..."}
                {step === "results" && "Import completed successfully."}
              </p>
            </div>
            {step !== "importing" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  handleReset();
                }}
                className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Upload Step */}
            {step === "upload" && (
              <FileUpload
                onUpload={handleUpload}
                isUploading={isUploading}
                error={error}
              />
            )}

            {/* Preview Step */}
            {step === "preview" && (
              <ImportPreviewStep
                fileName={fileName}
                fileSize={fileSize}
                rawRecords={rawRecords}
                previewColumns={previewColumns}
                error={error}
                handleReset={handleReset}
              />
            )}

            {/* Importing Step */}
            {step === "importing" && (
              <ImportingStep importProgress={importProgress} />
            )}

            {/* Results Step */}
            {step === "results" && importResult && (
              <ImportResultsStep
                importResult={importResult}
                fileName={fileName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onRowClick={setSelectedLead}
              />
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
            {step === "upload" && (
              <div className="flex w-full justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    handleReset();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {step === "preview" && (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  id="confirm-import-btn"
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                >
                  <Upload className="size-4" />
                  Confirm Import
                </button>
              </>
            )}

            {step === "importing" && (
              <div className="flex w-full justify-between items-center text-sm text-muted-foreground">
                <span>Please wait while AI processes your data...</span>
                <button
                  type="button"
                  onClick={cancelImport}
                  className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 font-medium transition-colors cursor-pointer"
                >
                  Cancel Import
                </button>
              </div>
            )}

            {step === "results" && (
              <div className="flex w-full justify-end">
                <button
                  type="button"
                  onClick={handleCloseAndRefresh}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  View Leads
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <LeadDetailsDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  );
}

