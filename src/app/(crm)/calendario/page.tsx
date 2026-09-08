import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReservationActions } from "@/components/crm/reservation-actions";
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_STYLES } from "@/lib/reservation-status";
import { confirmReservation, cancelReservation } from "./actions";

const DATETIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function CalendarioPage() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const supabase = await createClient();
  const { data: reservations } = await supabase
    .from("reservations")
    .select(
      "id, status, starts_at, ends_at, expires_at, notes, services(name), leads(name), clients(name)",
    )
    .gte("starts_at", yesterday.toISOString())
    .order("starts_at", { ascending: true })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Calendario
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Reservas y pre-reservas. La sincronización con Google Calendar
            todavía no está conectada — falta crear las credenciales OAuth en
            Google Cloud.
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
            {reservations?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                  No hay reservas próximas.
                </td>
              </tr>
            )}

            {reservations?.map((reservation) => (
              <tr
                key={reservation.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  {DATETIME_FORMAT.format(new Date(reservation.starts_at))}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {reservation.services?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {reservation.clients?.name ?? reservation.leads?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${RESERVATION_STATUS_STYLES[reservation.status]}`}
                  >
                    {RESERVATION_STATUS_LABELS[reservation.status]}
                    {reservation.status === "PRE_RESERVED" && reservation.expires_at
                      ? ` · vence ${DATETIME_FORMAT.format(new Date(reservation.expires_at))}`
                      : ""}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ReservationActions
                    id={reservation.id}
                    status={reservation.status}
                    confirmAction={confirmReservation}
                    cancelAction={cancelReservation}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
