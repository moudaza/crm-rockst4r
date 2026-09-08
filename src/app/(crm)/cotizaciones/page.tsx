export default function CotizacionesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Cotizaciones
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Las cotizaciones se gestionan en Plataforma Cotizaciones, no acá —
          para no duplicar información ni tener dos listas.
        </p>
      </div>

      <a
        href="https://plataforma-cotizaciones.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Abrir Cotizaciones →
      </a>
    </div>
  );
}
