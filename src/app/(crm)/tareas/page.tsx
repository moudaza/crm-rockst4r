export default function TareasPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Tareas
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Las tareas del equipo se gestionan en MagicFlow, no acá — para no
          duplicar información ni tener dos listas.
        </p>
      </div>

      <a
        href="https://tareas.bymoudaza.workers.dev/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Abrir Tareas (MagicFlow) →
      </a>
    </div>
  );
}
