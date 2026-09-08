import "server-only";
import { createClient } from "@/lib/supabase/server";

// Integración OAuth con Google Calendar. Conexión única compartida por todo
// el equipo (una sola fila en google_calendar_connection), no una cuenta de
// Google por usuario del CRM.
//
// `import "server-only"` evita que GOOGLE_CLIENT_SECRET o los tokens
// terminen en el bundle del navegador — este módulo solo se usa desde
// Server Components, Server Actions o Route Handlers.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const CONNECTION_ID = "00000000-0000-0000-0000-000000000001";
const REFRESH_MARGIN_MS = 60_000;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: requiredEnv("GOOGLE_CLIENT_ID"),
    redirect_uri: requiredEnv("GOOGLE_REDIRECT_URI"),
    response_type: "code",
    scope: CALENDAR_SCOPE,
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function getGoogleCalendarConnection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("google_calendar_connection")
    .select("*")
    .eq("id", CONNECTION_ID)
    .maybeSingle();
  return data;
}

export async function exchangeCodeForConnection(code: string, connectedBy: string) {
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: requiredEnv("GOOGLE_REDIRECT_URI"),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Google rechazó el código de autorización: ${await tokenResponse.text()}`);
  }

  const tokens = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
  };

  if (!tokens.refresh_token) {
    throw new Error(
      "Google no devolvió un refresh_token (pasa si ya habías autorizado esta app antes). " +
        "Quitá el acceso en myaccount.google.com/permissions y volvé a intentar.",
    );
  }

  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userInfo = userInfoResponse.ok
    ? ((await userInfoResponse.json()) as { email?: string })
    : null;

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

  const supabase = await createClient();
  const { error } = await supabase.from("google_calendar_connection").upsert({
    id: CONNECTION_ID,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: expiresAt.toISOString(),
    scope: tokens.scope,
    calendar_email: userInfo?.email ?? null,
    connected_by: connectedBy,
  });

  if (error) throw new Error(error.message);
}

export async function disconnectGoogleCalendar() {
  const supabase = await createClient();
  await supabase.from("google_calendar_connection").delete().eq("id", CONNECTION_ID);
}

export async function getValidAccessToken(): Promise<string | null> {
  const connection = await getGoogleCalendarConnection();
  if (!connection) return null;

  const expiresAt = new Date(connection.token_expires_at);
  const now = new Date();
  if (expiresAt.getTime() - now.getTime() > REFRESH_MARGIN_MS) {
    return connection.access_token;
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: connection.refresh_token,
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) return null;

  const tokens = (await response.json()) as { access_token: string; expires_in: number };
  const newExpiresAt = new Date();
  newExpiresAt.setSeconds(newExpiresAt.getSeconds() + tokens.expires_in);

  const supabase = await createClient();
  await supabase
    .from("google_calendar_connection")
    .update({ access_token: tokens.access_token, token_expires_at: newExpiresAt.toISOString() })
    .eq("id", CONNECTION_ID);

  return tokens.access_token;
}

export type GoogleCalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
};

type RawGoogleEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

async function fetchCalendarEvents(params: {
  timeMin: string;
  timeMax?: string;
  maxResults?: number;
}): Promise<{ events: GoogleCalendarEvent[]; error: "not_connected" | "api_error" | null }> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return { events: [], error: "not_connected" };

  const connection = await getGoogleCalendarConnection();
  const calendarId = connection?.calendar_id ?? "primary";

  const query = new URLSearchParams({
    timeMin: params.timeMin,
    maxResults: String(params.maxResults ?? 50),
    singleEvents: "true",
    orderBy: "startTime",
  });
  if (params.timeMax) query.set("timeMax", params.timeMax);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${query.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) return { events: [], error: "api_error" };

  const data = (await response.json()) as { items?: RawGoogleEvent[] };
  const events: GoogleCalendarEvent[] = (data.items ?? [])
    // Eventos "de todo el día" (cumpleaños, recordatorios, feriados) solo
    // traen `date`, no `dateTime` — no son sesiones con horario real, se
    // excluyen acá para que no aparezcan como si ocuparan toda la grilla.
    .filter((item) => item.start?.dateTime && item.end?.dateTime)
    .map((item) => ({
      id: item.id,
      summary: item.summary ?? "(sin título)",
      start: item.start!.dateTime!,
      end: item.end!.dateTime!,
    }));

  return { events, error: null };
}

export async function listUpcomingCalendarEvents(maxResults = 5) {
  return fetchCalendarEvents({ timeMin: new Date().toISOString(), maxResults });
}

/** Eventos de Google Calendar en un rango — para mezclar con las reservas
 * propias del CRM en la vista de Calendario (eventos creados directo en
 * Google, como los que vienen de la página de reservas del estudio, no
 * tienen una fila en `reservations`). */
export async function listCalendarEventsInRange(timeMin: string, timeMax: string) {
  return fetchCalendarEvents({ timeMin, timeMax, maxResults: 100 });
}

export type BusyInterval = { start: string; end: string };

export async function getFreeBusy(
  timeMin: string,
  timeMax: string,
): Promise<{ busy: BusyInterval[]; error: "not_connected" | "api_error" | null }> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return { busy: [], error: "not_connected" };

  const connection = await getGoogleCalendarConnection();
  const calendarId = connection?.calendar_id ?? "primary";

  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: calendarId }] }),
  });

  if (!response.ok) return { busy: [], error: "api_error" };

  const data = (await response.json()) as {
    calendars?: Record<string, { busy?: BusyInterval[] }>;
  };
  const busy = data.calendars?.[calendarId]?.busy ?? [];

  return { busy, error: null };
}

/**
 * Crea el evento en Google Calendar correspondiente a una reserva
 * CONFIRMED del CRM. Devuelve null si no hay conexión o si Google rechaza
 * la creación — quien llama debe seguir adelante igual (el CRM sigue siendo
 * la fuente de verdad de la reserva, el evento de Calendar es un reflejo).
 */
export async function createCalendarEvent(event: {
  summary: string;
  description?: string;
  startsAt: string;
  endsAt: string;
}): Promise<{ id: string } | null> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;

  const connection = await getGoogleCalendarConnection();
  const calendarId = connection?.calendar_id ?? "primary";

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.startsAt, timeZone: "America/Bogota" },
        end: { dateTime: event.endsAt, timeZone: "America/Bogota" },
      }),
    },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as { id: string };
  return { id: data.id };
}

/** Borra el evento de Google Calendar de una reserva cancelada. Falla en
 * silencio si no hay conexión o Google rechaza el borrado — el estado del
 * CRM (CANCELLED) manda igual. */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return;

  const connection = await getGoogleCalendarConnection();
  const calendarId = connection?.calendar_id ?? "primary";

  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}
