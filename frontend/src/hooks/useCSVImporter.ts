"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import type { RawRecord, ImportConfirmResponse, ImportProgress } from "@/types/interface";
import { uploadCSV, importConfirm, ApiError } from "@/services/api";

/** Possible steps in the wizard flow */
export type WizardStep = "upload" | "preview" | "importing" | "results";

interface UseCSVImporterReturn {
  step: WizardStep;
  rawRecords: RawRecord[];
  headers: string[];
  importResult: ImportConfirmResponse | null;
  importProgress: ImportProgress | null;
  isUploading: boolean;
  error: string | null;
  handleUpload: (file: File) => Promise<void>;
  handleConfirmImport: () => Promise<void>;
  handleReset: () => void;
}

/**
 * Custom hook that orchestrates the full CSV import wizard flow.
 * Manages step transitions, API calls, and all shared state.
 */
export function useCSVImporter(): UseCSVImporterReturn {
  const [step, setStep] = useState<WizardStep>("upload");
  const [rawRecords, setRawRecords] = useState<RawRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importResult, setImportResult] =
    useState<ImportConfirmResponse | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    setImportProgress({
      currentBatch: 0,
      totalBatches: Math.ceil(rawRecords.length / 15),
      percentage: 0,
      importedCount: 0,
      skippedCount: 0,
      failedCount: 0,
    });

    try {
      const result: ImportConfirmResponse = await importConfirm(rawRecords, (progressMessage) => {
        if (progressMessage.type === "progress") {
          setImportProgress({
            currentBatch: progressMessage.batchIndex,
            totalBatches: progressMessage.totalBatches,
            percentage: Math.round((progressMessage.batchIndex / progressMessage.totalBatches) * 100),
            importedCount: progressMessage.importedCount,
            skippedCount: progressMessage.skippedCount,
            failedCount: progressMessage.failedCount,
          });
        }
      });
      setImportResult(result);
      setStep("results");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during import."
      );
      setStep("preview");
    } finally {
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
    setImportResult(null);
    setImportProgress(null);
    setIsUploading(false);
    setError(null);
  }, []);

  return {
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
  };
}
