"use client";

import React, { useEffect, useState } from "react";
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Database, 
  Calendar, 
  FileText, 
  AlignLeft 
} from "lucide-react";
import type { TargetLead } from "@/types/interface";
import { cn, formatISTDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

interface LeadDetailsDrawerProps {
  lead: TargetLead | null;
  onClose: () => void;
}

const emptyLead: TargetLead = {
  created_at: "",
  name: "",
  email: "",
  country_code: "",
  mobile_without_country_code: "",
  company: "",
  city: "",
  state: "",
  country: "",
  lead_owner: "",
  crm_status: "GOOD_LEAD_FOLLOW_UP",
  crm_note: "",
  data_source: "",
  possession_time: "",
  description: "",
};

export function LeadDetailsDrawer({ lead, onClose }: LeadDetailsDrawerProps): React.JSX.Element {
  const [activeLead, setActiveLead] = useState<TargetLead | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Synchronize state for animation
  useEffect(() => {
    if (lead) {
      setActiveLead(lead);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [lead]);

  // Close details side drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const displayLead = activeLead || emptyLead;

  return (
    <>
      {/* Backdrop overlay */}
      <button
        type="button"
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-60 bg-black/40 backdrop-blur-sm transition-all duration-300 cursor-default border-none outline-none p-0 m-0 w-full h-full text-left",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        aria-label="Close details"
      />

      {/* Drawer content */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-65 w-full max-w-md bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
      >
        {/* Drawer Header */}
        <div className="relative flex items-start justify-between p-6 border-b border-border bg-muted/10">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground tracking-tight">{displayLead.name || "Unnamed Lead"}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium">{displayLead.company || "No Company"}</span>
              {displayLead.company && <span className="text-muted-foreground/30">•</span>}
              <StatusBadge status={displayLead.crm_status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        
        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm">
          {/* Section: Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Contact Details</h4>
            
            <div className="grid grid-cols-2 gap-4 pl-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Email Address</span>
                  {displayLead.email ? (
                    <a href={`mailto:${displayLead.email}`} className="text-sm font-medium break-all select-all text-primary hover:underline">
                      {displayLead.email}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground italic">Not Provided</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Phone className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Phone Number</span>
                  <p className="text-sm font-mono font-medium text-foreground select-all">
                    {displayLead.mobile_without_country_code 
                      ? (() => {
                          const code = displayLead.country_code || "";
                          const cleanCode = code.startsWith("+") ? code : `+${code}`;
                          return `${code ? `${cleanCode} ` : ""}${displayLead.mobile_without_country_code}`;
                        })()
                      : "Not Provided"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Section: Location */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Location</h4>
            <div className="flex gap-3 pl-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 self-start">
                <MapPin className="size-4" />
              </div>
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">City</span>
                  <p className="text-sm font-medium text-foreground">{displayLead.city || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">State</span>
                  <p className="text-sm font-medium text-foreground">{displayLead.state || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Country</span>
                  <p className="text-sm font-medium text-foreground">{displayLead.country || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Section: Acquisition & Management */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Lead Info & Owner</h4>
            <div className="grid grid-cols-2 gap-4 pl-1">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 self-start">
                  <User className="size-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Lead Owner</span>
                  <p className="text-sm font-medium text-foreground break-all">{displayLead.lead_owner || "Unassigned"}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 self-start">
                  <Database className="size-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Data Source</span>
                  <p className="text-sm font-medium text-foreground">{displayLead.data_source || "—"}</p>
                </div>
              </div>
            </div>

            {displayLead.possession_time && (
              <div className="flex gap-3 pl-1 pt-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 self-start">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Possession Time</span>
                  <p className="text-sm font-medium text-foreground">{displayLead.possession_time}</p>
                </div>
              </div>
            )}
          </div>

          <hr className="border-border/50" />

          {/* Section: Notes & Comments */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
              <FileText className="size-4 text-primary" />
              <span>Notes & Remarks</span>
            </div>
            <div className="rounded-xl bg-accent/20 border border-border/50 p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap wrap-break-word max-h-48 overflow-y-auto custom-scrollbar">
              {displayLead.crm_note || <span className="text-muted-foreground italic">No notes available.</span>}
            </div>
          </div>

          {/* Section: Description */}
          {displayLead.description && (
            <>
              <hr className="border-border/50" />
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  <AlignLeft className="size-4 text-primary" />
                  <span>Additional Description</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
                  {displayLead.description}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-border p-4 bg-muted/10 text-center">
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase block font-medium">
            Created: {formatISTDate(displayLead.created_at)}
          </span>
        </div>
      </div>
    </>
  );
}
