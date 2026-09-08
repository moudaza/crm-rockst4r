import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WeekCalendar } from "@/components/crm/week-calendar";
import {
  getGoogleCalendarConnection,
  listCalendarEventsInRange,
  getEventColorPalette,
  getConnectedCalendarColor,
  type GoogleColor,
} from "@/lib/integrations/google-calendar";
import { todayInBogota } from "@/lib/timezone";
import type { CalendarRow } from "@/lib/calendar-row";
import { getManualPaymentAccounts } from "@/lib/manual-payment-info";
import { confirmReservation, cancelReservation, generatePaymentLink, deleteReservation } from "./actions";

export default async function CalendarioPage() {
  const now = new Date();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 90);

  const supabase = await createClient();
  const [
    { data: reservations },
    googleConnection,
    googleEventsResult,
    eventColorPalette,
    calendarDefaultColor,
  ] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        "id, status, starts_at, ends_at, expires_at, notes, google_event_id, services(name), leads(name), clients(name)",
      )
      .gte("starts_at", now.toISOString())
      .order("starts_at", { ascending: true })
      .limit(200),
    getGoogleCalendarConnection(),
    listCalendarEventsInRange(now.toISOString(), horizon.toISOString()),
    getEventColorPalette(),
    getConnectedCalendarColor(),
  ]);

  const syncedGoogleEventIds = new Set(
    (reservations ?? []).map((r) => r.google_event_id).filter((id): id is string => !!id),
  );

  const fallbackColor: GoogleColor = { background: "#4285F4", foreground: "#ffffff" };
  const resolveColor = (colorId: string | undefined): GoogleColor =>
    (colorId && eventColorPalette[colorId]) || calendarDefaultColor || fallbackColor;

  const crmRows: CalendarRow[] = (reservations ?? []).map((r) => ({
    source: "crm",
    id: r.id,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    status: r.status,
    expiresAt: r.expires_at,
    serviceName: r.services?.name ?? "—",
    contactName: r.clients?.name ?? r.leads?.name ?? "—",
  }));

  const googleRows: CalendarRow[] = googleEventsResult.events
    .filter((event) => event.start && event.end && !syncedGoogleEventIds.has(event.id))
    .map((event) => {
      const color = resolveColor(event.colorId);
      return {
        source: "google",
        id: event.id,
        startsAt: event.start!,
        endsAt: event.end!,
        summary: event.summary,
        backgroundColor: color.background,
        foregroundColor: color.foreground,
      };
    });

  const rows = [...crmRows, ...googleRows];

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
          className="btn-primary"
        >
          Nueva reserva
        </Link>
      </div>

      <WeekCalendar
        rows={rows}
        todayDateStr={todayInBogota()}
        confirmAction={confirmReservation}
        cancelAction={cancelReservation}
        generatePaymentLinkAction={generatePaymentLink}
        deleteAction={deleteReservation}
        manualPaymentAccounts={getManualPaymentAccounts()}
      />
    </div>
  );
}
