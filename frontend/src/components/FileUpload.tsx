"use client";

import React, { useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  error: string | null;
}

/**
 * Drag-and-drop file upload zone with validation, loading states, and error display.
 */
export function FileUpload({
  onUpload,
  isUploading,
  error: externalError,
}: FileUploadProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    file,
    isDragging,
    error: validationError,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    resetFile,
  } = useFileUpload();

  const displayError: string | null = externalError || validationError;

  const handleUploadClick = async (): Promise<void> => {
    if (file) {
      await onUpload(file);
    }
  };

  const handleBrowseClick = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!file ? handleBrowseClick : undefined}
        className={cn(
          "relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-300",
          isDragging &&
            "border-primary bg-primary/5 shadow-lg shadow-primary/10",
          !isDragging && !file && "border-border hover:border-primary/50 hover:bg-card/50",
          file && "cursor-default border-primary/30 bg-card/50"
        )}
      >
        {!file ? (
          <>
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Drop your CSV file here
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              or{" "}
              <span className="font-medium text-primary underline underline-offset-2">
                browse to upload
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .csv files up to 10MB
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <FileSpreadsheet className="size-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {file.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={(e): void => {
                e.stopPropagation();
                resetFile();
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="size-3" />
              Remove
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
          id="csv-file-input"
        />
      </div>

      {/* Error message */}
      {displayError && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Upload Error
            </p>
            <p className="mt-1 text-sm text-destructive/80">{displayError}</p>
          </div>
        </div>
      )}

      {/* Upload button */}
      {file && (
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          id="upload-parse-btn"
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Uploading & Parsing...
            </>
          ) : (
            <>
              <Upload className="size-4" />
              Upload & Parse CSV
            </>
          )}
        </button>
      )}
    </div>
  );
}
