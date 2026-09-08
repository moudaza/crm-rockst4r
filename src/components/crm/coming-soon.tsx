export function ComingSoon({ title, stage }: { title: string; stage: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Este módulo se construye en {stage} del proyecto.
      </p>
    </div>
  );
}
