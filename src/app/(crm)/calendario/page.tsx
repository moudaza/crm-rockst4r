import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReservationActions } from "@/components/crm/reservation-actions";
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_STYLES } from "@/lib/reservation-status";
import {
  getGoogleCalendarConnection,
  listCalendarEventsInRange,
} from "@/lib/integrations/google-calendar";
import { confirmReservation, cancelReservation } from "./actions";

const DATETIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

type CalendarRow =
  | {
      source: "crm";
      id: string;
      startsAt: string;
      status: "PRE_RESERVED" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
      expiresAt: string | null;
      serviceName: string;
      contactName: string;
    }
  | {
      source: "google";
      id: string;
      startsAt: string;
      summary: string;
    };

export default async function CalendarioPage() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 90);

  const supabase = await createClient();
  const [{ data: reservations }, googleConnection, googleEventsResult] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        "id, status, starts_at, ends_at, expires_at, notes, google_event_id, services(name), leads(name), clients(name)",
      )
      .gte("starts_at", yesterday.toISOString())
      .order("starts_at", { ascending: true })
      .limit(100),
    getGoogleCalendarConnection(),
    listCalendarEventsInRange(yesterday.toISOString(), horizon.toISOString()),
  ]);

  const syncedGoogleEventIds = new Set(
    (reservations ?? []).map((r) => r.google_event_id).filter((id): id is string => !!id),
  );

  const crmRows: CalendarRow[] = (reservations ?? []).map((r) => ({
    source: "crm",
    id: r.id,
    startsAt: r.starts_at,
    status: r.status,
    expiresAt: r.expires_at,
    serviceName: r.services?.name ?? "—",
    contactName: r.clients?.name ?? r.leads?.name ?? "—",
  }));

  const googleRows: CalendarRow[] = googleEventsResult.events
    .filter((event) => event.start && !syncedGoogleEventIds.has(event.id))
    .map((event) => ({
      source: "google",
      id: event.id,
      startsAt: event.start!,
      summary: event.summary,
    }));

  const rows = [...crmRows, ...googleRows].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Calendario
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {googleConnection
              ? `Reservas del CRM + eventos de Google Calendar (${googleConnection.calendar_email ?? googleConnection.calendar_id}).`
              : "Reservas y pre-reservas. Google Calendar no está conectado — conectalo en Configuración para ver disponibilidad real y sincronizar reservas confirmadas."}
          </p>
        </div>
        <Link
          href="/calendario/nueva"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Nueva reserva
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Fecha y hora</th>
              <th className="px-4 py-3 font-medium">Servicio</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                  No hay reservas próximas.
                </td>
              </tr>
            )}

            {rows.map((row) =>
              row.source === "crm" ? (
                <tr
                  key={`crm-${row.id}`}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {DATETIME_FORMAT.format(new Date(row.startsAt))}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {row.serviceName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {row.contactName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${RESERVATION_STATUS_STYLES[row.status]}`}
                    >
                      {RESERVATION_STATUS_LABELS[row.status]}
                      {row.status === "PRE_RESERVED" && row.expiresAt
                        ? ` · vence ${DATETIME_FORMAT.format(new Date(row.expiresAt))}`
                        : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ReservationActions
                      id={row.id}
                      status={row.status}
                      confirmAction={confirmReservation}
                      cancelAction={cancelReservation}
                    />
                  </td>
                </tr>
              ) : (
                <tr
                  key={`google-${row.id}`}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {DATETIME_FORMAT.format(new Date(row.startsAt))}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400" colSpan={2}>
                    {row.summary}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500">
                      Externa (Google)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-400 dark:text-zinc-600">
                    —
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
