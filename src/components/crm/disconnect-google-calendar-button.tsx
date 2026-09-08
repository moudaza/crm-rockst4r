"use client";

import { useTransition } from "react";

export function DisconnectGoogleCalendarButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => action())}
      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
    >
      {isPending ? "Desconectando..." : "Desconectar"}
    </button>
  );
}
