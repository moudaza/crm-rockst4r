import { StatCard } from "@/components/crm/stat-card";
import { SalesChart } from "@/components/crm/sales-chart";
import { SalesGoalIndicator } from "@/components/crm/sales-goal-indicator";
import { createClient } from "@/lib/supabase/server";
import { getSalesSummary } from "@/lib/sales";

// Reservas, cotizaciones, pagos y tareas se conectan cuando existan esas
// tablas (Etapa 2 en curso, Etapa 3-4 para reservas/pagos). Tareas vive en
// MagicFlow (tareas.bymoudaza.workers.dev), no en este CRM.
const PLACEHOLDER_STATS = [
  { label: "Reservas de hoy", value: 0 },
  { label: "Próximas reservas", value: 0 },
  { label: "Cotizaciones pendientes", value: 0 },
  { label: "Pagos pendientes", value: 0 },
  { label: "Pagos recientes", value: 0 },
  { label: "Tareas pendientes", value: 0 },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ count: newLeadsCount }, sales] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "NUEVO"),
    getSalesSummary(),
  ]);

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
        <StatCard label="Prospectos nuevos" value={newLeadsCount ?? 0} />
        {PLACEHOLDER_STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart daily={sales.daily} weekly={sales.weekly} monthly={sales.monthly} />
        </div>
        <SalesGoalIndicator currentMonthTotal={sales.currentMonthTotal} />
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
