"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportConfirmResponse, TargetLead } from "@/types/lead";

/** Column keys to display in the results table */
const DISPLAY_COLUMNS: { key: keyof TargetLead; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "country_code", label: "Code" },
  { key: "mobile_without_country_code", label: "Mobile" },
  { key: "company", label: "Company" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "country", label: "Country" },
  { key: "crm_status", label: "Status" },
  { key: "data_source", label: "Source" },
];

interface ParsedResultsProps {
  result: ImportConfirmResponse;
  onReset: () => void;
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

/**
 * Single metric card displaying a count with icon and color styling.
 */
function MetricCard({
  label,
  value,
  icon,
  colorClass,
}: MetricCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border p-4 transition-all",
        colorClass
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-lg bg-background/50">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}

/**
 * Renders a table of TargetLead records with fixed display columns.
 */
function LeadTable({ leads }: { leads: TargetLead[] }): React.JSX.Element {
  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No records to display.</p>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar overflow-auto rounded-xl border border-border bg-card/50 max-h-[400px]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-card border-b border-border">
          <tr>
            <th className="sticky left-0 z-20 bg-card px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r border-border w-12">
              #
            </th>
            {DISPLAY_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {leads.map((lead: TargetLead, index: number) => (
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
              {DISPLAY_COLUMNS.map(({ key }) => (
                <td
                  key={`${index}-${key}`}
                  className="max-w-[250px] truncate whitespace-nowrap px-4 py-2.5 text-foreground"
                  title={String(lead[key] || "")}
                >
                  {key === "crm_status" ? (
                    <StatusBadge status={lead.crm_status} />
                  ) : (
                    lead[key] || (
                      <span className="text-muted-foreground/50">—</span>
                    )
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Color-coded badge for CRM status values.
 */
function StatusBadge({
  status,
}: {
  status: string;
}): React.JSX.Element {
  const colorMap: Record<string, string> = {
    GOOD_LEAD_FOLLOW_UP:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    DID_NOT_CONNECT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    BAD_LEAD: "bg-red-500/10 text-red-400 border-red-500/20",
    SALE_DONE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        colorMap[status] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

/**
 * Displays import results with metrics cards, imported leads table,
 * and collapsible skipped leads section.
 */
export function ParsedResults({
  result,
  onReset,
}: ParsedResultsProps): React.JSX.Element {
  const [showSkipped, setShowSkipped] = useState<boolean>(false);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Metrics cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total Processed"
          value={result.totalProcessed}
          icon={<BarChart3 className="size-6 text-foreground" />}
          colorClass="border-border bg-card text-foreground"
        />
        <MetricCard
          label="Imported"
          value={result.importedCount}
          icon={<CheckCircle2 className="size-6 text-emerald-400" />}
          colorClass="border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
        />
        <MetricCard
          label="Skipped"
          value={result.skippedCount}
          icon={<AlertTriangle className="size-6 text-amber-400" />}
          colorClass="border-amber-500/20 bg-amber-500/5 text-amber-400"
        />
        <MetricCard
          label="Failed"
          value={result.failedCount}
          icon={<XCircle className="size-6 text-red-400" />}
          colorClass="border-red-500/20 bg-red-500/5 text-red-400"
        />
      </div>

      {/* Imported leads table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Imported Leads ({result.importedCount})
        </h3>
        <LeadTable leads={result.importedLeads} />
      </div>

      {/* Skipped leads (collapsible) */}
      {result.skippedCount > 0 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={(): void => setShowSkipped(!showSkipped)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {showSkipped ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            Skipped Leads ({result.skippedCount})
          </button>
          {showSkipped && <LeadTable leads={result.skippedLeads} />}
        </div>
      )}

      {/* Reset button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onReset}
          id="upload-another-btn"
          className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          Upload Another File
        </button>
      </div>
    </div>
  );
}
