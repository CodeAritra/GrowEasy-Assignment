"use client";

import React from "react";
import { Rows3, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RawRecord } from "@/types/lead";

interface CSVPreviewTableProps {
  records: RawRecord[];
  headers: string[];
  onConfirmImport: () => void;
  onUploadAnother: () => void;
}

/**
 * Interactive table preview for raw CSV data with sticky headers,
 * horizontal/vertical scrolling, and confirm import action.
 */
export function CSVPreviewTable({
  records,
  headers,
  onConfirmImport,
  onUploadAnother,
}: CSVPreviewTableProps): React.JSX.Element {
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

      {/* Table container with scroll */}
      <div className="custom-scrollbar overflow-auto rounded-xl border border-border bg-card/50 max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card border-b border-border">
            <tr>
              <th className="sticky left-0 z-20 bg-card px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r border-border w-12">
                #
              </th>
              {headers.map((header: string) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {records.map((record: RawRecord, index: number) => (
              <tr
                key={index}
                className={cn(
                  "transition-colors hover:bg-accent/30",
                  index % 2 === 0 ? "bg-transparent" : "bg-card/30"
                )}
              >
                <td className="sticky left-0 z-10 bg-card px-4 py-2.5 text-xs font-mono text-muted-foreground border-r border-border">
                  {index + 1}
                </td>
                {headers.map((header: string) => (
                  <td
                    key={`${index}-${header}`}
                    className="max-w-[300px] truncate whitespace-nowrap px-4 py-2.5 text-foreground"
                    title={record[header] || ""}
                  >
                    {record[header] || (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onUploadAnother}
          className="flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          Upload Different File
        </button>
        <button
          type="button"
          onClick={onConfirmImport}
          id="confirm-import-btn"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
        >
          Confirm Import
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
