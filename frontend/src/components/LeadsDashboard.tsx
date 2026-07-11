"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Plus,
  Users,
  CheckCircle2,
  PhoneOff,
  XCircle,
  ShoppingCart,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { DataTable, type ColumnDefinition } from "@/components/DataTable";
import { ImportModal } from "@/components/ImportModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExportCSVButton } from "@/components/ExportCSVButton";
import type { TargetLead } from "@/types/interface";
import { cn, formatISTDate } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  GOOD_LEAD_FOLLOW_UP: {
    label: "Follow Up",
    className: "bg-primary/10 text-primary border-primary/30",
    icon: <CheckCircle2 className="size-3" />,
  },
  DID_NOT_CONNECT: {
    label: "No Connect",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    icon: <PhoneOff className="size-3" />,
  },
  BAD_LEAD: {
    label: "Bad Lead",
    className: "bg-destructive/10 text-destructive border-destructive/30",
    icon: <XCircle className="size-3" />,
  },
  SALE_DONE: {
    label: "Sale Done",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: <ShoppingCart className="size-3" />,
  },
};

/**
 * Status badge component for CRM status display.
 */
function StatusBadge({ status }: { status: string }): React.JSX.Element {
  const c = STATUS_CONFIG[status] || {
    label: status || "—",
    className: "bg-muted text-muted-foreground border-border",
    icon: null,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        c.className
      )}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

/**
 * Main dashboard component that displays all CRM leads and provides
 * an import modal for adding new leads via CSV upload.
 */
export function LeadsDashboard(): React.JSX.Element {
  const { leads, isLoading, error, refetch } = useLeads();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<TargetLead | null>(null);

  // Stats computed from leads
  const stats = useMemo(() => {
    const total = leads.length;
    const followUp = leads.filter((l) => l.crm_status === "GOOD_LEAD_FOLLOW_UP").length;
    const noConnect = leads.filter((l) => l.crm_status === "DID_NOT_CONNECT").length;
    const badLead = leads.filter((l) => l.crm_status === "BAD_LEAD").length;
    const saleDone = leads.filter((l) => l.crm_status === "SALE_DONE").length;
    return { total, followUp, noConnect, badLead, saleDone };
  }, [leads]);

  // Column definitions for the leads DataTable
  const columns: ColumnDefinition<TargetLead>[] = useMemo(
    () => [
      {
        key: "created_at",
        label: "Created At",
        render: (row: TargetLead): React.ReactNode => formatISTDate(row.created_at),
      },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "country_code", label: "Country Code" },
      {
        key: "mobile_without_country_code",
        label: "Mobile",
        render: (row: TargetLead): React.ReactNode => {
          const code = row.country_code || "";
          const mobile = row.mobile_without_country_code || "";
          if (!mobile) return <span className="text-muted-foreground/50">—</span>;
          const cleanCode = code.startsWith("+") ? code : `+${code}`;
          return (
            <span className="font-mono text-xs">
              {code ? `${cleanCode} ` : ""}
              {mobile}
            </span>
          );
        },
      },
      { key: "company", label: "Company" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
      { key: "lead_owner", label: "Lead Owner" },
      {
        key: "crm_status",
        label: "Status",
        render: (row: TargetLead): React.ReactNode => <StatusBadge status={row.crm_status} />,
      },
      { key: "crm_note", label: "Notes/Remarks" },
      { key: "data_source", label: "Source" },
      { key: "possession_time", label: "Possession Time" },
      { key: "description", label: "Description" },
    ],
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">GrowEasy</h1>
              <p className="text-xs text-muted-foreground">
                AI CRM Dashboard · Powered by Aritra Dhank
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
            >
              <Plus className="size-4" />
              Import Leads
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Leads
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="size-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Follow Up
              </span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.followUp}</p>
          </div>
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <PhoneOff className="size-4 text-yellow-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                No Connect
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">{stats.noConnect}</p>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="size-4 text-destructive" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Bad Lead
              </span>
            </div>
            <p className="text-2xl font-bold text-destructive">{stats.badLead}</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="size-4 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sale Done
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{stats.saleDone}</p>
          </div>
        </div>

        {/* Table Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">All Leads</h2>
            <p className="text-sm text-muted-foreground">
              {leads.length} lead{leads.length !== 1 ? "s" : ""} in your CRM database
            </p>
          </div>
          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <ExportCSVButton
                data={leads}
                filename="all_leads.csv"
                className="px-3 py-2 text-sm font-medium"
              />
            )}
            <button
              type="button"
              onClick={() => void refetch()}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              title="Refresh leads"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="size-8 animate-spin mb-4" />
            <p className="text-sm">Loading leads...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Failed to load leads
              </p>
              <p className="mt-1 text-sm text-destructive/80">{error}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 text-sm font-medium text-destructive underline underline-offset-2 hover:text-destructive/80 cursor-pointer"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed border-border">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Users className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No leads yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
              Import your first batch of leads from a CSV file. Our AI will
              automatically map columns to the GrowEasy CRM format.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer"
            >
              <Plus className="size-4" />
              Import Your First Leads
            </button>
          </div>
        )}

        {/* Leads DataTable */}
        {!isLoading && !error && leads.length > 0 && (
          <DataTable data={leads} columns={columns} maxHeight={550} onRowClick={setSelectedLead} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          GrowEasy AI CRM Dashboard · Powered by Aritra Dhank
        </p>
      </footer>

      {/* Import Modal */}
      <ImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImportComplete={() => void refetch()}
      />

      {/* Lead Details Side Drawer */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedLead(null)}
        />
      )}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border p-6 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
          selectedLead ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selectedLead && (
          <>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedLead.name || "Unnamed Lead"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedLead.company || "No Company"}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="rounded-lg p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 space-y-5 custom-scrollbar text-sm">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">CRM Status</span>
                <StatusBadge status={selectedLead.crm_status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Email</span>
                  <p className="font-medium text-foreground select-all break-all">{selectedLead.email || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Phone</span>
                  <p className="font-medium text-foreground select-all font-mono">
                    {selectedLead.mobile_without_country_code 
                      ? (() => {
                          const code = selectedLead.country_code || "";
                          const cleanCode = code.startsWith("+") ? code : `+${code}`;
                          return `${code ? `${cleanCode} ` : ""}${selectedLead.mobile_without_country_code}`;
                        })()
                      : "—"
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">City</span>
                  <p className="font-medium text-foreground">{selectedLead.city || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">State</span>
                  <p className="font-medium text-foreground">{selectedLead.state || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Country</span>
                  <p className="font-medium text-foreground">{selectedLead.country || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Lead Owner</span>
                  <p className="font-medium text-foreground break-all">{selectedLead.lead_owner || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Data Source</span>
                  <p className="font-medium text-foreground">{selectedLead.data_source || "—"}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Possession Time</span>
                <p className="font-medium text-foreground">{selectedLead.possession_time || "—"}</p>
              </div>

              <div className="border-t border-border/50 pt-4">
                <span className="text-xs text-muted-foreground block mb-1">Notes / Remarks (crm_note)</span>
                <div className="rounded-lg bg-accent/20 border border-border/50 p-3 text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto custom-scrollbar">
                  {selectedLead.crm_note || "No custom remarks available."}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Additional Description</span>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">{selectedLead.description || "—"}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 text-center">
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase block">
                Created: {formatISTDate(selectedLead.created_at)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
