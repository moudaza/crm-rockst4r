import { bogotaDateTime, todayInBogota } from "@/lib/timezone";

export const MONTHLY_MIN_GOAL = 2_500_000;
export const MONTHLY_RECOMMENDED_GOAL = 5_000_000;

export type SalesPoint = { label: string; total: number };

export type SalesSummary = {
  daily: SalesPoint[];
  weekly: SalesPoint[];
  monthly: SalesPoint[];
  currentMonthTotal: number;
};

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Las ventas se alimentan de sesiones de fotos vendidas (reservas confirmadas
// + pago aprobado). Esas tablas todavía no existen (Etapa 4: pagos/BOLD) —
// por ahora esto arma la estructura con series en cero, lista para
// reemplazar por una consulta real a `reservations`/`payments` cuando
// existan. Los rangos de cada vista son sobre la fecha de hoy en Bogotá,
// no en la zona horaria del servidor.
export async function getSalesSummary(): Promise<SalesSummary> {
  const startOfToday = bogotaDateTime(todayInBogota(), "00:00:00");

  // Diario: las 24 horas de hoy.
  const daily: SalesPoint[] = Array.from({ length: 24 }, (_, hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    total: 0,
  }));

  // Semanal: lunes a domingo de la semana en curso.
  const weekly: SalesPoint[] = Array.from({ length: 7 }, (_, i) => ({
    label: WEEKDAY_LABELS[i],
    total: 0,
  }));

  // Mensual: todos los días del mes en curso (28 a 31, según el mes).
  const daysInMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth() + 1, 0).getDate();
  const monthly: SalesPoint[] = Array.from({ length: daysInMonth }, (_, i) => ({
    label: String(i + 1),
    total: 0,
  }));

  return { daily, weekly, monthly, currentMonthTotal: 0 };
}
