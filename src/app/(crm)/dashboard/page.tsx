import { StatCard } from "@/components/crm/stat-card";
import { SalesChart } from "@/components/crm/sales-chart";
import { SalesGoalIndicator } from "@/components/crm/sales-goal-indicator";
import { createClient } from "@/lib/supabase/server";
import { getSalesSummary } from "@/lib/sales";
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_STYLES } from "@/lib/reservation-status";

// Cotizaciones y pagos se conectan cuando existan esas tablas/integraciones
// (Cotizaciones vive en plataforma-cotizaciones, Pagos es Etapa 4 con BOLD).
// Tareas vive en MagicFlow (tareas.bymoudaza.workers.dev), no en este CRM.
const PLACEHOLDER_STATS = [
  { label: "Cotizaciones pendientes", value: 0 },
  { label: "Pagos pendientes", value: 0 },
  { label: "Pagos recientes", value: 0 },
  { label: "Tareas pendientes", value: 0 },
];

const UPCOMING_FORMAT = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function DashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const now = new Date();

  const supabase = await createClient();
  const [
    { count: newLeadsCount },
    { count: todayCount },
    { count: upcomingCount },
    { data: upcomingReservations },
    sales,
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "NUEVO"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .in("status", ["PRE_RESERVED", "CONFIRMED"])
      .gte("starts_at", startOfToday.toISOString())
      .lt("starts_at", startOfTomorrow.toISOString()),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .in("status", ["PRE_RESERVED", "CONFIRMED"])
      .gte("starts_at", now.toISOString()),
    supabase
      .from("reservations")
      .select("id, status, starts_at, services(name), leads(name), clients(name)")
      .in("status", ["PRE_RESERVED", "CONFIRMED"])
      .gte("starts_at", now.toISOString())
      .order("starts_at", { ascending: true })
      .limit(5),
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
        <StatCard label="Reservas de hoy" value={todayCount ?? 0} />
        <StatCard label="Próximas reservas" value={upcomingCount ?? 0} />
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

        {!upcomingReservations || upcomingReservations.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No hay reservas próximas.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {upcomingReservations.map((reservation) => (
              <li
                key={reservation.id}
                className="flex items-center justify-between border-b border-zinc-100 pb-2 text-sm last:border-0 last:pb-0 dark:border-zinc-900"
              >
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {reservation.clients?.name ?? reservation.leads?.name ?? "—"}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {" "}
                    · {reservation.services?.name ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {UPCOMING_FORMAT.format(new Date(reservation.starts_at))}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${RESERVATION_STATUS_STYLES[reservation.status]}`}
                  >
                    {RESERVATION_STATUS_LABELS[reservation.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
