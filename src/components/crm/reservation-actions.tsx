"use client";

import { useTransition } from "react";

export function ReservationActions({
  id,
  status,
  confirmAction,
  cancelAction,
}: {
  id: string;
  status: "PRE_RESERVED" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
  confirmAction: (id: string) => Promise<void>;
  cancelAction: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  if (status !== "PRE_RESERVED" && status !== "CONFIRMED") {
    return <span className="text-sm text-zinc-400 dark:text-zinc-600">—</span>;
  }

  return (
    <div className="flex justify-end gap-3">
      {status === "PRE_RESERVED" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => confirmAction(id))}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50 dark:text-emerald-400"
        >
          Confirmar
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => cancelAction(id))}
        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
      >
        Cancelar
      </button>
    </div>
  );
}
