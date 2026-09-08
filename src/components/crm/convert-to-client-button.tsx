"use client";

import { useState, useTransition } from "react";

export function ConvertToClientButton({
  id,
  action,
}: {
  id: string;
  action: (id: string) => Promise<{ error: string } | void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await action(id);
            if (result?.error) setError(result.error);
          })
        }
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        {isPending ? "Convirtiendo..." : "Convertir a cliente"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
