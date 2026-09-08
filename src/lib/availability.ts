import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getFreeBusy } from "@/lib/integrations/google-calendar";
import { bogotaDateTime } from "@/lib/timezone";
import type { Database } from "@/lib/supabase/database.types";

export type AvailableSlot = { startsAt: string; endsAt: string };

export type AvailabilityError =
  | "service_not_found"
  | "no_windows_for_day"
  | "google_not_connected"
  | "google_api_error";

function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Turnos disponibles para un servicio en una fecha dada. Combina:
 * 1) las ventanas configuradas en service_availability_windows (día/horario/buffer),
 * 2) el free/busy real de Google Calendar,
 * 3) las reservas propias del CRM (PRE_RESERVED vigentes + CONFIRMED) —
 *    necesario porque reservar en el CRM todavía no crea el evento en
 *    Google Calendar, así que ninguna de las dos fuentes por sí sola alcanza.
 *
 * `client` es opcional — por defecto usa el cliente con sesión del staff
 * (RLS normal). Las rutas de Manychat, que llaman sin sesión de usuario,
 * pasan un cliente `service_role` para saltar RLS.
 */
export async function getAvailableSlots(
  serviceId: string,
  date: string,
  client?: SupabaseClient<Database>,
): Promise<{ slots: AvailableSlot[]; error: AvailabilityError | null }> {
  const supabase = client ?? (await createClient());

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .eq("active", true)
    .maybeSingle();

  if (!service) return { slots: [], error: "service_not_found" };

  const dayOfWeek = bogotaDateTime(date, "12:00:00").getDay();

  const { data: windows } = await supabase
    .from("service_availability_windows")
    .select("start_time, end_time, buffer_minutes")
    .eq("service_id", serviceId)
    .eq("day_of_week", dayOfWeek);

  if (!windows || windows.length === 0) return { slots: [], error: "no_windows_for_day" };

  const candidates: AvailableSlot[] = [];
  for (const window of windows) {
    const stepMs = (service.duration_minutes + window.buffer_minutes) * 60_000;
    const durationMs = service.duration_minutes * 60_000;
    const windowStart = bogotaDateTime(date, window.start_time);
    const lastStart = bogotaDateTime(date, window.end_time);

    for (
      let candidate = windowStart;
      candidate.getTime() <= lastStart.getTime();
      candidate = new Date(candidate.getTime() + stepMs)
    ) {
      candidates.push({
        startsAt: candidate.toISOString(),
        endsAt: new Date(candidate.getTime() + durationMs).toISOString(),
      });
    }
  }

  if (candidates.length === 0) return { slots: [], error: "no_windows_for_day" };

  const dayStart = bogotaDateTime(date, "00:00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);

  const { busy, error: freeBusyError } = await getFreeBusy(
    dayStart.toISOString(),
    dayEnd.toISOString(),
    client,
  );
  if (freeBusyError) {
    return {
      slots: [],
      error: freeBusyError === "not_connected" ? "google_not_connected" : "google_api_error",
    };
  }

  const nowIso = new Date().toISOString();
  const { data: reservations } = await supabase
    .from("reservations")
    .select("starts_at, ends_at")
    .lt("starts_at", dayEnd.toISOString())
    .gt("ends_at", dayStart.toISOString())
    .or(`status.eq.CONFIRMED,and(status.eq.PRE_RESERVED,expires_at.gt.${nowIso})`);

  const busyIntervals = [
    ...busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })),
    ...(reservations ?? []).map((r) => ({
      start: new Date(r.starts_at),
      end: new Date(r.ends_at),
    })),
  ];

  const slots = candidates.filter((candidate) => {
    const start = new Date(candidate.startsAt);
    const end = new Date(candidate.endsAt);
    return !busyIntervals.some((busyInterval) =>
      intervalsOverlap(start, end, busyInterval.start, busyInterval.end),
    );
  });

  return { slots, error: null };
}
