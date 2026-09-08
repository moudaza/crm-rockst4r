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
