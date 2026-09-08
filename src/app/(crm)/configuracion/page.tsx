import {
  getGoogleCalendarConnection,
  listUpcomingCalendarEvents,
} from "@/lib/integrations/google-calendar";
import { DisconnectGoogleCalendarButton } from "@/components/crm/disconnect-google-calendar-button";
import { disconnectGoogleCalendarAction } from "./actions";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Cancelaste la autorización en Google.",
  missing_code: "Google no envió el código de autorización.",
  not_authenticated: "Tu sesión del CRM expiró — volvé a iniciar sesión e intentá de nuevo.",
};

const DATETIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ google_calendar_connected?: string; google_calendar_error?: string }>;
}) {
  const params = await searchParams;
  const connection = await getGoogleCalendarConnection();
  const { events } = connection
    ? await listUpcomingCalendarEvents(5)
    : { events: [] as Awaited<ReturnType<typeof listUpcomingCalendarEvents>>["events"] };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Configuración
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Integraciones del CRM.
        </p>
      </div>

      {params.google_calendar_connected && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
          Google Calendar conectado correctamente.
        </p>
      )}
      {params.google_calendar_error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          No se pudo conectar Google Calendar:{" "}
          {GOOGLE_ERROR_MESSAGES[params.google_calendar_error] ?? params.google_calendar_error}
        </p>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Google Calendar
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {connection
                ? `Conectado como ${connection.calendar_email ?? connection.calendar_id}`
                : "No conectado. La disponibilidad de reservas no puede consultarse hasta conectar."}
            </p>
          </div>

          {connection ? (
            <DisconnectGoogleCalendarButton action={disconnectGoogleCalendarAction} />
          ) : (
            <a
              href="/api/auth/google/connect"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Conectar Google Calendar
            </a>
          )}
        </div>

        {connection && (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-900">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Próximos eventos (prueba de conexión)
            </h3>
            {events.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                No hay eventos próximos en el calendario conectado.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {events.map((event) => (
                  <li key={event.id} className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {event.summary}
                    </span>{" "}
                    · {event.start ? DATETIME_FORMAT.format(new Date(event.start)) : "—"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
