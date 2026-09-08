export const MONTHLY_MIN_GOAL = 2_500_000;
export const MONTHLY_RECOMMENDED_GOAL = 5_000_000;

export type SalesPoint = { label: string; total: number };

export type SalesSummary = {
  daily: SalesPoint[];
  weekly: SalesPoint[];
  monthly: SalesPoint[];
  currentMonthTotal: number;
};

const DAY_LABEL = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" });
const MONTH_LABEL = new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit" });

// Las ventas se alimentan de sesiones de fotos vendidas (reservas confirmadas
// + pago aprobado). Esas tablas todavía no existen (Etapa 3: reservas,
// Etapa 4: pagos/BOLD) — por ahora esto arma la estructura con series en
// cero, lista para reemplazar por una consulta real a `reservations`/
// `payments` cuando existan.
export async function getSalesSummary(): Promise<SalesSummary> {
  const today = new Date();

  const daily: SalesPoint[] = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (13 - i));
    return { label: DAY_LABEL.format(date), total: 0 };
  });

  const weekly: SalesPoint[] = Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i;
    return { label: weeksAgo === 0 ? "Sem actual" : `Sem -${weeksAgo}`, total: 0 };
  });

  const monthly: SalesPoint[] = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    return { label: MONTH_LABEL.format(date), total: 0 };
  });

  return { daily, weekly, monthly, currentMonthTotal: 0 };
}
