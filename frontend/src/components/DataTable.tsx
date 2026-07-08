"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ColumnDefinition<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  maxHeight?: number;
  rowHeight?: number;
  bufferCount?: number;
}

/**
 * Highly reusable, virtualized data table.
 * Supports sticky headers, dynamic columns, alternating rows,
 * custom cell renderers (e.g. badges, tooltips), and virtualized scrolling.
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  maxHeight = 450,
  rowHeight = 38,
  bufferCount = 10,
}: DataTableProps<T>): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground border border-border rounded-xl bg-card/20">
        <p className="text-sm">No records to display.</p>
      </div>
    );
  }

  // Virtualization math
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferCount);
  const endIndex = Math.min(
    data.length,
    Math.ceil((scrollTop + maxHeight) / rowHeight) + bufferCount
  );

  const paddingTop = startIndex * rowHeight;
  const paddingBottom = (data.length - endIndex) * rowHeight;
  const visibleRows = data.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="custom-scrollbar overflow-auto rounded-xl border border-border bg-card/50"
      style={{ maxHeight: `${maxHeight}px` }}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-card border-b border-border">
          <tr>
            <th className="sticky left-0 z-20 bg-card px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r border-border w-12">
              #
            </th>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {paddingTop > 0 && (
            <tr style={{ height: `${paddingTop}px` }}>
              <td colSpan={columns.length + 1} style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {visibleRows.map((row, index) => {
            const actualIndex = startIndex + index;
            return (
              <tr
                key={actualIndex}
                className={cn(
                  "transition-colors hover:bg-accent/30",
                  actualIndex % 2 === 0 ? "bg-transparent" : "bg-card/30"
                )}
                style={{ height: `${rowHeight}px` }}
              >
                <td className="sticky left-0 z-10 bg-card px-4 py-2.5 text-xs font-mono text-muted-foreground border-r border-border">
                  {actualIndex + 1}
                </td>
                {columns.map((col) => {
                  const val = row[col.key as string];
                  return (
                    <td
                      key={`${actualIndex}-${String(col.key)}`}
                      className="max-w-[300px] truncate whitespace-nowrap px-4 py-2.5 text-foreground"
                      title={String(val !== null && val !== undefined ? val : "")}
                    >
                      {col.render ? (
                        col.render(row, actualIndex)
                      ) : val !== null && val !== undefined && val !== "" ? (
                        String(val)
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr style={{ height: `${paddingBottom}px` }}>
              <td colSpan={columns.length + 1} style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
