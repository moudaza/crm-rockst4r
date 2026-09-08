import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "#0071e3",
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
}) {
  return (
    <div className="card flex items-start justify-between p-5">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {value}
        </p>
      </div>
      {Icon && (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] shadow-sm"
          style={{ backgroundColor: color }}
        >
          <Icon className="h-5 w-5 text-white" strokeWidth={2.25} />
        </span>
      )}
    </div>
  );
}
