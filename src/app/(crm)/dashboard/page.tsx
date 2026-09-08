import { CalendarCheck, CalendarClock, UserPlus, FileText, Wallet, Receipt, CheckSquare } from "lucide-react";
import { StatCard } from "@/components/crm/stat-card";
import { SalesChart } from "@/components/crm/sales-chart";
import { SalesGoalIndicator } from "@/components/crm/sales-goal-indicator";
import { createClient } from "@/lib/supabase/server";
import { getSalesSummary } from "@/lib/sales";
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_STYLES } from "@/lib/reservation-status";
import { bogotaDateTime, todayInBogota } from "@/lib/timezone";

// Cotizaciones y pagos se conectan cuando existan esas tablas/integraciones
// (Cotizaciones vive en plataforma-cotizaciones, Pagos es Etapa 4 con BOLD).
// Tareas vive en MagicFlow (tareas.bymoudaza.workers.dev), no en este CRM.
const PLACEHOLDER_STATS = [
  { label: "Cotizaciones pendientes", value: 0, icon: FileText, color: "#ff2d55" },
  { label: "Pagos pendientes", value: 0, icon: Wallet, color: "#ff9500" },
  { label: "Pagos recientes", value: 0, icon: Receipt, color: "#34c759" },
  { label: "Tareas pendientes", value: 0, icon: CheckSquare, color: "#ffcc00" },
];

const UPCOMING_FORMAT = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

export default async function DashboardPage() {
  const startOfToday = bogotaDateTime(todayInBogota(), "00:00:00");
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60_000);
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
        <StatCard label="Reservas de hoy" value={todayCount ?? 0} icon={CalendarCheck} color="#0071e3" />
        <StatCard label="Próximas reservas" value={upcomingCount ?? 0} icon={CalendarClock} color="#ff3b30" />
        <StatCard label="Prospectos nuevos" value={newLeadsCount ?? 0} icon={UserPlus} color="#ff9500" />
        {PLACEHOLDER_STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart daily={sales.daily} weekly={sales.weekly} monthly={sales.monthly} />
        </div>
        <SalesGoalIndicator currentMonthTotal={sales.currentMonthTotal} />
      </div>

      <div className="card p-5">
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
