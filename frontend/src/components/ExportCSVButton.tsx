"use client";

import React from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportCSVButtonProps<T> {
  data: T[];
  columns?: { key: keyof T | string; label: string }[];
  filename?: string;
  className?: string;
}

/**
 * Reusable CSV export button that takes an array of objects and converts it
 * to a downloadable CSV file. It supports exporting a subset of fields with custom headers.
 */
export function ExportCSVButton<T extends Record<string, any>>({
  data,
  columns,
  filename = "export.csv",
  className,
}: ExportCSVButtonProps<T>): React.JSX.Element {
  const handleExport = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    if (!data || data.length === 0) return;

    let keys: (keyof T | string)[] = [];
    let headers: string[] = [];

    if (columns && columns.length > 0) {
      keys = columns.map((c) => c.key);
      headers = columns.map((c) => c.label);
    } else {
      // If no columns are provided, extract all keys from the first record
      keys = Object.keys(data[0]);
      headers = keys.map((k) => String(k));
    }

    // Process headers row
    const csvHeaders = headers
      .map((h) => `"${h.replace(/"/g, '""')}"`)
      .join(",");

    // Process data rows
    const csvRows = data.map((row) => {
      return keys
        .map((key) => {
          const val = row[key as string];
          let stringVal = "";
          if (val !== null && val !== undefined) {
            if (typeof val === "object") {
              stringVal = JSON.stringify(val);
            } else {
              stringVal = String(val);
            }
          }
          // Escape double quotes
          return `"${stringVal.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const currentDate = new Date().toISOString().slice(0, 10);
    let downloadFilename = filename;
    if (downloadFilename.endsWith(".csv")) {
      const base = downloadFilename.slice(0, -4);
      downloadFilename = `${base}_${currentDate}.csv`;
    } else {
      downloadFilename = `${downloadFilename}_${currentDate}.csv`;
    }

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", downloadFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm",
        className
      )}
      title="Export data as CSV"
    >
      <Download className="size-3.5 text-muted-foreground hover:text-foreground" />
      Export CSV
    </button>
  );
}
