"use client";

import { useState, useCallback, useRef } from "react";
import Papa from "papaparse";
import type { RawRecord, ImportConfirmResponse, ImportProgress, BatchInfo } from "@/types/interface";
import { uploadCSV, importConfirm, ApiError } from "@/services/api";

/** Possible steps in the wizard flow */
export type WizardStep = "upload" | "preview" | "importing" | "results";

/**
 * Clean up verbose rate limit error messages from the AI completion response.
 * Extracts the user-friendly reset timer if available, otherwise simplifies the error.
 */
function cleanRetryReason(errorMsg: string): string {
  if (!errorMsg) return "";

  const lowerMsg = errorMsg.toLowerCase();

  // 1. Bad gateway check (contains 502 or "bad gateway")
  if (errorMsg.includes("502") || lowerMsg.includes("bad gateway")) {
    return "Bad gateway";
  }

  // 2. Network error check
  if (lowerMsg.includes("network error") || lowerMsg.includes("fetch failed")) {
    return "Fetch failed due to network error";
  }

  // 3. JSON/parsing error check
  if (
    lowerMsg.includes("json parse error") ||
    lowerMsg.includes("parsing error") ||
    lowerMsg.includes("parse error") ||
    lowerMsg.includes("invalid json")
  ) {
    return "Error in parsing";
  }

  // 4. Rate limiting: "rate limiting the error is fine dont change it"
  // Try to extract the raw error message from Groq JSON if present, otherwise return errorMsg.
  if (errorMsg.includes("Groq API error")) {
    try {
      const jsonStart = errorMsg.indexOf("{");
      if (jsonStart !== -1) {
        const jsonStr = errorMsg.substring(jsonStart);
        const parsed = JSON.parse(jsonStr);
        if (parsed.error && typeof parsed.error.message === "string") {
          const msg = parsed.error.message;
          if (parsed.error.code === "rate_limit_exceeded") {
            return "Rate limit exceeded. Too many requests.";
          }
          return msg;
        }
      }
    } catch {
      // ignore JSON parse fallback
    }
  }

  return errorMsg;
}

interface UseCSVImporterReturn {
  step: WizardStep;
  rawRecords: RawRecord[];
  headers: string[];
  fileName: string;
  fileSize: number;
  importResult: ImportConfirmResponse | null;
  importProgress: ImportProgress | null;
  isUploading: boolean;
  error: string | null;
  handleUpload: (file: File) => Promise<void>;
  handleConfirmImport: () => Promise<void>;
  handleReset: () => void;
  cancelImport: () => void;
}

/**
 * Custom hook that orchestrates the full CSV import wizard flow.
 * Manages step transitions, API calls, and all shared state.
 */
export function useCSVImporter(): UseCSVImporterReturn {
  const [step, setStep] = useState<WizardStep>("upload");
  const [rawRecords, setRawRecords] = useState<RawRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [importResult, setImportResult] =
    useState<ImportConfirmResponse | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Aborts the active import fetch event stream and reverts back to the preview step.
   */
  const cancelImport = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStep("preview");
    setImportProgress(null);
    setError("Import cancelled by user.");
  }, []);

  /**
   * Handles CSV file upload: sends to backend for parsing, then client-side
   * PapaParse preview. Transitions to the preview step on success.
   */
  const handleUpload = useCallback(async (file: File): Promise<void> => {
    setIsUploading(true);
    setError(null);

    try {
      // Upload to backend for server-side parsing
      const response = await uploadCSV(file);

      setFileName(file.name);
      setFileSize(file.size);
      setRawRecords(response.records);
      setHeaders(response.headers);
      setStep("preview");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback: try client-side parsing with PapaParse
        try {
          const text: string = await file.text();
          const result = Papa.parse<RawRecord>(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header: string): string => header.trim(),
          });

          if (result.errors.length > 0) {
            setError(`CSV parsing error: ${result.errors[0].message}`);
            return;
          }

          if (!result.data || result.data.length === 0) {
            setError("The uploaded CSV file is empty.");
            return;
          }

          setRawRecords(result.data);
          setHeaders(Object.keys(result.data[0]));
          setFileName(file.name);
          setFileSize(file.size);
          setStep("preview");
        } catch {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while uploading the file."
          );
        }
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Sends the parsed records to the backend for AI mapping and import.
   * Transitions to importing → results.
   */
  const handleConfirmImport = useCallback(async (): Promise<void> => {
    setStep("importing");
    setError(null);

    const totalBatches = Math.ceil(rawRecords.length / 15);
    const initialBatchStatuses: BatchInfo[] = Array.from({ length: totalBatches }, () => ({
      status: "pending" as const,
    }));

    setImportProgress({
      currentBatch: 1,
      totalBatches,
      totalRows: rawRecords.length,
      percentage: 0,
      importedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      batchStatuses: initialBatchStatuses,
    });

    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;

    try {
      const result: ImportConfirmResponse = await importConfirm(rawRecords, (progressMessage) => {
        if (progressMessage.type === "progress") {
          setImportProgress((prev) => {
            if (!prev) return null;
            const newStatuses = [...prev.batchStatuses];
            const batchIdx = progressMessage.batchIndex - 1;

            // If this batch was previously processing/retrying and we just got a progress update,
            // it means the batch is now being processed (or re-processed after retry success)
            if (batchIdx >= 0 && batchIdx < newStatuses.length) {
              // Mark previous batches as completed if they were processing
              for (let j = 0; j < batchIdx; j++) {
                if (newStatuses[j].status === "processing" || newStatuses[j].status === "retrying") {
                  newStatuses[j] = { status: "completed" };
                }
              }
              // Mark current batch as processing (clear any retry state)
              if (newStatuses[batchIdx].status !== "failed") {
                newStatuses[batchIdx] = { status: "processing" };
              }
            }

            return {
              ...prev,
              currentBatch: progressMessage.batchIndex,
              totalBatches: progressMessage.totalBatches,
              percentage: Math.round(((progressMessage.batchIndex - 1) / progressMessage.totalBatches) * 100),
              importedCount: progressMessage.importedCount,
              skippedCount: progressMessage.skippedCount,
              failedCount: progressMessage.failedCount,
              retryMessage: undefined,
              retryReason: undefined,
              retryAttempt: undefined,
              retryMaxAttempts: undefined,
              batchStatuses: newStatuses,
            };
          });
        } else if (progressMessage.type === "retry") {
          setImportProgress((prev) => {
            if (!prev) return null;
            const newStatuses = [...prev.batchStatuses];
            const batchIdx = progressMessage.batchIndex - 1;

            if (batchIdx >= 0 && batchIdx < newStatuses.length) {
              newStatuses[batchIdx] = {
                status: "retrying",
                retryReason: cleanRetryReason(progressMessage.errorMsg),
                retryAttempt: progressMessage.attempt,
                retryMaxAttempts: progressMessage.maxAttempts,
              };
            }

            return {
              ...prev,
              retryAttempt: progressMessage.attempt,
              retryMaxAttempts: progressMessage.maxAttempts,
              retryMessage: `Retrying attempt ${progressMessage.attempt} of ${progressMessage.maxAttempts - 1}`,
              retryReason: cleanRetryReason(progressMessage.errorMsg),
              batchStatuses: newStatuses,
            };
          });
        }
      }, ctrl.signal);

      // Mark all remaining processing/pending batches as completed on success
      setImportProgress((prev) => {
        if (!prev) return null;
        const finalStatuses = prev.batchStatuses.map((b) =>
          b.status === "processing" || b.status === "pending" ? { status: "completed" as const } : b
        );
        return { ...prev, percentage: 100, batchStatuses: finalStatuses };
      });

      setImportResult(result);
      setStep("results");
    } catch (err: unknown) {
      if (ctrl.signal.aborted) {
        return;
      }

      // Mark the current batch as failed
      setImportProgress((prev) => {
        if (!prev) return null;
        const newStatuses = [...prev.batchStatuses];
        const failedIdx = prev.currentBatch - 1;
        if (failedIdx >= 0 && failedIdx < newStatuses.length) {
          if (newStatuses[failedIdx].status !== "completed") {
            newStatuses[failedIdx] = { status: "failed" };
          }
        }
        return { ...prev, batchStatuses: newStatuses };
      });

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during import."
      );
      setStep("preview");
    } finally {
      if (abortControllerRef.current === ctrl) {
        abortControllerRef.current = null;
      }
      setImportProgress(null);
    }
  }, [rawRecords]);

  /**
   * Resets the entire wizard back to the upload step.
   */
  const handleReset = useCallback((): void => {
    setStep("upload");
    setRawRecords([]);
    setHeaders([]);
    setFileName("");
    setFileSize(0);
    setImportResult(null);
    setImportProgress(null);
    setIsUploading(false);
    setError(null);
  }, []);

  return {
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
  };
}
