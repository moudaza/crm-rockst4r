import { createClient } from "@/lib/supabase/server";
import { bogotaDateTime, startOfWeekBogota, todayInBogota, toBogotaDateString, toBogotaHourMinute } from "@/lib/timezone";

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

// Las ventas son pagos APPROVED de BOLD (Etapa 4) — `payments.paid_at`, no
// la fecha de la reserva. Los rangos de cada vista son sobre la fecha de
// hoy en Bogotá, nunca en la zona horaria del servidor.
export async function getSalesSummary(): Promise<SalesSummary> {
  const today = todayInBogota();
  const [year, month] = today.split("-").map(Number);

  const daily: SalesPoint[] = Array.from({ length: 24 }, (_, hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    total: 0,
  }));

  const weekStart = startOfWeekBogota(today);
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    toBogotaDateString(new Date(weekStart.getTime() + i * 24 * 60 * 60_000).toISOString()),
  );
  const weekly: SalesPoint[] = weekDates.map((_, i) => ({ label: WEEKDAY_LABELS[i], total: 0 }));

  // Días del mes en curso vía Date.UTC (no .getDate() sobre un Date local,
  // que dependería de la zona horaria del servidor).
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthly: SalesPoint[] = Array.from({ length: daysInMonth }, (_, i) => ({
    label: String(i + 1),
    total: 0,
  }));

  const monthStart = bogotaDateTime(`${year}-${String(month).padStart(2, "0")}-01`, "00:00:00");
  const nextMonthFirst = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const monthEnd = bogotaDateTime(nextMonthFirst, "00:00:00");
  const rangeStart = weekStart < monthStart ? weekStart : monthStart;
  const rangeEnd = monthEnd > new Date(weekStart.getTime() + 7 * 24 * 60 * 60_000)
    ? monthEnd
    : new Date(weekStart.getTime() + 7 * 24 * 60 * 60_000);

  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, paid_at")
    .eq("status", "APPROVED")
    .gte("paid_at", rangeStart.toISOString())
    .lt("paid_at", rangeEnd.toISOString());

  let currentMonthTotal = 0;

  for (const payment of payments ?? []) {
    if (!payment.paid_at) continue;
    const dateStr = toBogotaDateString(payment.paid_at);
    const amount = payment.amount;

    if (dateStr === today) {
      const { hour } = toBogotaHourMinute(payment.paid_at);
      daily[hour].total += amount;
    }

    const weekIndex = weekDates.indexOf(dateStr);
    if (weekIndex !== -1) {
      weekly[weekIndex].total += amount;
    }

    const [rowYear, rowMonth, rowDay] = dateStr.split("-").map(Number);
    if (rowYear === year && rowMonth === month) {
      monthly[rowDay - 1].total += amount;
      currentMonthTotal += amount;
    }
  }

  return { daily, weekly, monthly, currentMonthTotal };
}
