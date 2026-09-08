"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import type { SalesPoint } from "@/lib/sales";

const TABS = [
  { key: "daily", label: "Diario" },
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensual" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function SalesChart({
  daily,
  weekly,
  monthly,
}: {
  daily: SalesPoint[];
  weekly: SalesPoint[];
  monthly: SalesPoint[];
}) {
  const [tab, setTab] = useState<TabKey>("daily");
  const data = { daily, weekly, monthly }[tab];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Ventas
        </h2>
        <div className="flex gap-1 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-900">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-100 dark:stroke-zinc-800" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              className="fill-zinc-500 dark:fill-zinc-400"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-zinc-500 dark:fill-zinc-400"
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(value: number) =>
                value === 0 ? "0" : `${Math.round(value / 1000)}k`
              }
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} className="fill-zinc-900 dark:fill-zinc-50" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
