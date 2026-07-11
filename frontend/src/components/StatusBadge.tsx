import React from "react";
import { CheckCircle2, PhoneOff, XCircle, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function StatusBadge({ status }: { status: string }): React.JSX.Element {
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
