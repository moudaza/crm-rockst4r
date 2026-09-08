// El estudio queda en Bogotá (UTC-5 todo el año, sin horario de verano).
export const STUDIO_TIME_ZONE = "America/Bogota";
const STUDIO_UTC_OFFSET = "-05:00";

/** Construye un Date a partir de una fecha ("YYYY-MM-DD") y hora ("HH:MM:SS")
 * interpretadas como hora de Bogotá, sin depender de la zona horaria del
 * servidor donde corre el código. */
export function bogotaDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}${STUDIO_UTC_OFFSET}`);
}

/** Fecha de "hoy" en Bogotá, como "YYYY-MM-DD" — no la del servidor. */
export function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: STUDIO_TIME_ZONE }).format(new Date());
}

/** Fecha ("YYYY-MM-DD") de un instante cualquiera, en Bogotá. */
export function toBogotaDateString(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: STUDIO_TIME_ZONE }).format(new Date(iso));
}

/** Hora y minuto (0-23 / 0-59) de un instante cualquiera, en Bogotá. */
export function toBogotaHourMinute(iso: string): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { hour, minute };
}

/** Lunes (00:00 Bogotá) de la semana que contiene `dateStr` ("YYYY-MM-DD"). */
export function startOfWeekBogota(dateStr: string): Date {
  const midnight = bogotaDateTime(dateStr, "00:00:00");
  const dayOfWeek = midnight.getDay(); // 0=domingo … 6=sábado
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(midnight.getTime() - daysSinceMonday * 24 * 60 * 60_000);
}
