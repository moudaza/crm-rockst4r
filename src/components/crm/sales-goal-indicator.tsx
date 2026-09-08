import { formatCurrency } from "@/lib/format";
import { MONTHLY_MIN_GOAL, MONTHLY_RECOMMENDED_GOAL } from "@/lib/sales";

export function SalesGoalIndicator({ currentMonthTotal }: { currentMonthTotal: number }) {
  const progressToRecommended = Math.min(
    100,
    (currentMonthTotal / MONTHLY_RECOMMENDED_GOAL) * 100,
  );
  const minMarkerPosition = (MONTHLY_MIN_GOAL / MONTHLY_RECOMMENDED_GOAL) * 100;
  const reachedMin = currentMonthTotal >= MONTHLY_MIN_GOAL;

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Meta del mes
        </h2>
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {formatCurrency(currentMonthTotal)}
        </span>
      </div>

      <div className="relative mt-4 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div
          className={`h-2 rounded-full transition-all ${
            reachedMin ? "bg-emerald-500" : "bg-[#0071e3] dark:bg-[#0a84ff]"
          }`}
          style={{ width: `${progressToRecommended}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-amber-500"
          style={{ left: `${minMarkerPosition}%` }}
          title={`Mínimo: ${formatCurrency(MONTHLY_MIN_GOAL)}`}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>Mínimo {formatCurrency(MONTHLY_MIN_GOAL)}</span>
        <span>Recomendado {formatCurrency(MONTHLY_RECOMMENDED_GOAL)}</span>
      </div>

      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        {reachedMin
          ? "Mínimo mensual alcanzado."
          : `Faltan ${formatCurrency(MONTHLY_MIN_GOAL - currentMonthTotal)} para el mínimo mensual.`}
      </p>
    </div>
  );
}
