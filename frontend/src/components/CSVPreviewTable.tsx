"use client";

import React from "react";
import { Rows3, ArrowRight, RotateCcw } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import type { RawRecord } from "@/types/interface";

interface CSVPreviewTableProps {
  records: RawRecord[];
  headers: string[];
  onConfirmImport: () => void;
  onUploadAnother: () => void;
}

/**
 * Interactive table preview for raw CSV data with sticky headers,
 * horizontal/vertical scrolling, and confirm import action.
 * Utilizes the reusable virtualized DataTable component.
 */
export function CSVPreviewTable({
  records,
  headers,
  onConfirmImport,
  onUploadAnother,
}: CSVPreviewTableProps): React.JSX.Element {
  // Generate column definitions from raw CSV headers
  const columns = headers.map((header) => ({
    key: header,
    label: header,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Rows3 className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              CSV Preview
            </h2>
            <p className="text-sm text-muted-foreground">
              {records.length} row{records.length !== 1 ? "s" : ""} ·{" "}
              {headers.length} column{headers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-medium">
            {records.length} rows
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-medium">
            {headers.length} cols
          </span>
        </div>
      </div>

      {/* Reusable Virtualized DataTable */}
      <DataTable data={records} columns={columns} maxHeight={450} />

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onUploadAnother}
          className="flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
        >
          <RotateCcw className="size-4" />
          Upload Different File
        </button>
        <button
          type="button"
          onClick={onConfirmImport}
          id="confirm-import-btn"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
        >
          Confirm Import
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
