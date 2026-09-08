import { getMagicflowTasks } from "@/lib/integrations/magicflow";
import { formatCurrency } from "@/lib/format";

const PRIORITY_LABELS: Record<string, string> = {
  none: "—",
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export default async function TareasPage() {
  const { tasks, error } = await getMagicflowTasks();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Tareas
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Vista de solo lectura de MagicFlow — para crear o editar, usá la
            app original.
          </p>
        </div>

        <a
          href="https://tareas.bymoudaza.workers.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit shrink-0 items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Abrir Tareas (MagicFlow) →
        </a>
      </div>

      {error === "not_configured" ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          Faltan las variables de entorno de MagicFlow
          (MAGICFLOW_SUPABASE_URL / MAGICFLOW_SUPABASE_SECRET_KEY).
        </p>
      ) : error ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-red-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-red-400">
          No se pudo leer MagicFlow: {error}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Vencimiento</th>
                <th className="px-4 py-3 font-medium">Prioridad</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                    No hay tareas.
                  </td>
                </tr>
              )}

              {tasks.map((task) => (
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
      )}
    </div>
  );
}
