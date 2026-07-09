"use client";

import React, { useRef } from "react";
import { FixedSizeList as List } from "react-window";
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
 * Highly reusable, virtualized data table using react-window.
 * Supports sticky headers, dynamic columns, alternating rows,
 * custom cell renderers (e.g. badges, tooltips), and virtualized scrolling.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  maxHeight = 450,
  rowHeight = 38,
  bufferCount = 10,
}: DataTableProps<T>): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground border border-border rounded-xl bg-card/20">
        <p className="text-sm">No records to display.</p>
      </div>
    );
  }

  // Calculate dynamic minimum width of the table row depending on number of columns.
  // The index column is 48px, and other columns are allocated a baseline width (e.g., 150px).
  const estimatedMinWidth = 48 + columns.length * 150;

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto rounded-xl border border-border bg-card/50 custom-scrollbar"
    >
      <div style={{ minWidth: `${estimatedMinWidth}px` }} className="w-full">
        {/* Table Header */}
        <div className="sticky top-0 z-10 flex bg-card border-b border-border font-semibold text-xs text-muted-foreground uppercase tracking-wider select-none">
          <div className="flex-none w-12 px-4 py-3 text-left border-r border-border flex items-center justify-start">
            #
          </div>
          {columns.map((col) => (
            <div
              key={String(col.key)}
              className="flex-1 px-4 py-3 text-left whitespace-nowrap flex items-center"
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Table Body (Virtualized list using react-window) */}
        <List
          height={maxHeight}
          itemCount={data.length}
          itemSize={rowHeight}
          width="100%"
          className="custom-scrollbar"
          overscanCount={bufferCount}
        >
          {({ index, style }) => {
            const row = data[index];
            return (
              <div
                style={style}
                className={cn(
                  "flex items-center text-sm border-b border-border/50 transition-colors hover:bg-accent/30",
                  index % 2 === 0 ? "bg-transparent" : "bg-card/30"
                )}
              >
                {/* Index Column */}
                <div className="flex-none w-12 h-full px-4 py-2.5 text-xs font-mono text-muted-foreground border-r border-border flex items-center justify-start">
                  {index + 1}
                </div>

                {/* Data Columns */}
                {columns.map((col) => {
                  const val = row[col.key as string];
                  return (
                    <div
                      key={`${index}-${String(col.key)}`}
                      className="flex-1 px-4 py-2.5 max-w-[300px] truncate whitespace-nowrap text-foreground flex items-center"
                      title={String(val !== null && val !== undefined ? val : "")}
                    >
                      {col.render ? (
                        col.render(row, index)
                      ) : val !== null && val !== undefined && val !== "" ? (
                        String(val)
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }}
        </List>
      </div>
    </div>
  );
}
