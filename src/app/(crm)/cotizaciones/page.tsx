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
        className="btn-primary w-fit"
      >
        Abrir Cotizaciones →
      </a>
    </div>
  );
}
