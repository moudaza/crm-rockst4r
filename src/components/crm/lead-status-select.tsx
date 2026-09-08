"use client";

import { useTransition } from "react";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER, type LeadStatus } from "@/lib/lead-status";

export function LeadStatusSelect({
  id,
  status,
  action,
}: {
  id: string;
  status: LeadStatus;
  action: (id: string, status: LeadStatus) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => action(id, e.target.value as LeadStatus))
      }
      className="input py-1 text-xs disabled:opacity-50"
    >
      {LEAD_STATUS_ORDER.map((value) => (
        <option key={value} value={value}>
          {LEAD_STATUS_LABELS[value]}
        </option>
      ))}
    </select>
  );
}
