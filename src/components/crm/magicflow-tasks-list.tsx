"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { MagicflowTask } from "@/lib/integrations/magicflow";

const PRIORITY_LABELS: Record<string, string> = {
  none: "—",
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const TABS = [
  { key: "mine", label: "Mías" },
  { key: "others", label: "De otros" },
  { key: "all", label: "Todas" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function MagicflowTasksList({ tasks }: { tasks: MagicflowTask[] }) {
  const [tab, setTab] = useState<TabKey>("mine");
  const [hideCompleted, setHideCompleted] = useState(true);

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        if (tab === "mine") return t.isMine;
        if (tab === "others") return !t.isMine;
        return true;
      })
      .filter((t) => !hideCompleted || !t.completed);
  }, [tasks, tab, hideCompleted]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-900">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-700"
          />
          Ocultar completadas
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Asignado a</th>
              <th className="px-4 py-3 font-medium">Vencimiento</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                  No hay tareas para mostrar.
                </td>
              </tr>
            )}

            {filtered.map((task) => (
              <tr
                key={task.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
              >
                <td
                  className={`px-4 py-3 font-medium ${
                    task.completed
                      ? "text-zinc-400 line-through dark:text-zinc-600"
                      : "text-zinc-900 dark:text-zinc-50"
                  }`}
                >
                  {task.title}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {task.assigneeLabel}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {task.due_date ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {PRIORITY_LABELS[task.priority] ?? task.priority}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {task.amount_cop ? formatCurrency(task.amount_cop) : "—"}
                  {task.amount_cop ? (task.paid ? " (pagado)" : " (pendiente)") : ""}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.completed
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    {task.completed ? "Completada" : "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
