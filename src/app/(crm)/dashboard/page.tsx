import { StatCard } from "@/components/crm/stat-card";

// Etapa 1: layout y estructura del dashboard con datos en cero.
// Las métricas reales se conectan a Supabase a partir de Etapa 2
// (prospectos/clientes/cotizaciones) y Etapa 3-4 (reservas/pagos).
const STATS = [
  { label: "Reservas de hoy", value: 0 },
  { label: "Próximas reservas", value: 0 },
  { label: "Prospectos nuevos", value: 0 },
  { label: "Cotizaciones pendientes", value: 0 },
  { label: "Pagos pendientes", value: 0 },
  { label: "Pagos recientes", value: 0 },
  { label: "Tareas pendientes", value: 0 },
  { label: "Resumen de ventas", value: "$0" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Resumen general de ROCKST4R STUDIO.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Próximas sesiones
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Todavía no hay datos. Este panel se completa a partir de Etapa 3
          (reservas + Google Calendar).
        </p>
      </div>
    </div>
  );
}
