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
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable, type ColumnDefinition } from "@/components/DataTable";
import type { ImportConfirmResponse, TargetLead } from "@/types/lead";

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

// Columns configuration for the unified GrowEasy CRM layout
const COLUMNS: ColumnDefinition<TargetLead>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "country_code", label: "Code" },
  { key: "mobile_without_country_code", label: "Mobile" },
  { key: "company", label: "Company" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "country", label: "Country" },
  {
    key: "crm_status",
    label: "Status",
    render: (lead) => <StatusBadge status={lead.crm_status} />,
  },
  { key: "data_source", label: "Source" },
];

/**
 * Displays import results with metrics cards, imported leads table,
 * and collapsible skipped leads section.
 */
export function ParsedResults({
  result,
  onReset,
}: ParsedResultsProps): React.JSX.Element {
  const [showSkipped, setShowSkipped] = useState<boolean>(false);

  const handleDownloadCSV = (): void => {
    const leads = result.importedLeads;
    if (!leads || leads.length === 0) return;

    const columns: (keyof TargetLead)[] = [
      "created_at",
      "name",
      "email",
      "country_code",
      "mobile_without_country_code",
      "company",
      "city",
      "state",
      "country",
      "lead_owner",
      "crm_status",
      "crm_note",
      "data_source",
      "possession_time",
      "description",
    ];

    const headers = columns.join(",");
    const rows = leads.map((lead) =>
      columns
        .map((col) => {
          const value = lead[col];
          const stringVal =
            value === null || value === undefined ? "" : String(value);
          const escaped = stringVal.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `groweasy_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Imported Leads ({result.importedCount})
          </h3>
          {result.importedCount > 0 && (
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
              id="download-leads-btn"
            >
              <Download className="size-4" />
              Download CSV
            </button>
          )}
        </div>
        <DataTable data={result.importedLeads} columns={COLUMNS} maxHeight={400} />
      </div>

      {/* Skipped leads (collapsible) */}
      {result.skippedCount > 0 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={(): void => setShowSkipped(!showSkipped)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            {showSkipped ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            Skipped Leads ({result.skippedCount})
          </button>
          {showSkipped && (
            <DataTable data={result.skippedLeads} columns={COLUMNS} maxHeight={400} />
          )}
        </div>
      )}

      {/* Reset button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onReset}
          id="upload-another-btn"
          className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
        >
          <RotateCcw className="size-4" />
          Upload Another File
        </button>
      </div>
    </div>
  );
}
