import { getMagicflowTasks } from "@/lib/integrations/magicflow";
import { MagicflowTasksList } from "@/components/crm/magicflow-tasks-list";

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
          className="btn-primary w-fit"
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
        <MagicflowTasksList tasks={tasks} />
      )}
    </div>
  );
}
