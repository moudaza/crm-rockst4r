"use client";

import { useTransition } from "react";

export function ToggleActiveButton({
  id,
  active,
  action,
}: {
  id: string;
  active: boolean;
  action: (id: string, active: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => action(id, !active))}
      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      {active ? "Desactivar" : "Activar"}
    </button>
  );
}
