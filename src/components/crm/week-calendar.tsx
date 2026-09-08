"use client";

import { useMemo, useState } from "react";
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_STYLES } from "@/lib/reservation-status";
import { startOfWeekBogota, toBogotaDateString, toBogotaHourMinute } from "@/lib/timezone";
import type { CalendarRow } from "@/lib/calendar-row";
import { ReservationActions } from "@/components/crm/reservation-actions";
import type { GeneratePaymentLinkResult } from "@/app/(crm)/calendario/actions";
import type { ManualPaymentAccount } from "@/lib/manual-payment-info";

const HOUR_START = 6;
const HOUR_END = 21;
const HOUR_HEIGHT = 48; // px
const MAX_WEEKS_FORWARD = 12;

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DAY_MONTH_FORMAT = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  timeZone: "America/Bogota",
});
const TIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

function rowKey(row: CalendarRow) {
  return `${row.source}-${row.id}`;
}

export function WeekCalendar({
  rows,
  todayDateStr,
  confirmAction,
  cancelAction,
  generatePaymentLinkAction,
  deleteAction,
  manualPaymentAccounts,
}: {
  rows: CalendarRow[];
  todayDateStr: string;
  confirmAction: (id: string) => Promise<void>;
  cancelAction: (id: string) => Promise<void>;
  generatePaymentLinkAction: (id: string) => Promise<GeneratePaymentLinkResult>;
  deleteAction: (id: string) => Promise<void>;
  manualPaymentAccounts: ManualPaymentAccount[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const weekStart = useMemo(() => {
    const base = startOfWeekBogota(todayDateStr);
    return new Date(base.getTime() + weekOffset * 7 * 24 * 60 * 60_000);
  }, [todayDateStr, weekOffset]);

  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart.getTime() + i * 24 * 60 * 60_000);
        return toBogotaDateString(d.toISOString());
      }),
    [weekStart],
  );

  const rowsByDate = useMemo(() => {
    const map = new Map<string, CalendarRow[]>();
    for (const row of rows) {
      const dateStr = toBogotaDateString(row.startsAt);
      const list = map.get(dateStr) ?? [];
      list.push(row);
      map.set(dateStr, list);
    }
    return map;
  }, [rows]);

  const selectedRow = rows.find((r) => rowKey(r) === selectedKey) ?? null;

  const rangeLabel = `${DAY_MONTH_FORMAT.format(weekStart)} – ${DAY_MONTH_FORMAT.format(
    new Date(weekStart.getTime() + 6 * 24 * 60 * 60_000),
  )}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Esta semana
          </button>
          <button
            type="button"
            disabled={weekOffset >= MAX_WEEKS_FORWARD}
            onClick={() => setWeekOffset((w) => Math.min(MAX_WEEKS_FORWARD, w + 1))}
            className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            ›
          </button>
        </div>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{rangeLabel}</span>
      </div>

      <div className="card overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-[56px_repeat(7,1fr)]">
          <div className="border-b border-zinc-200 dark:border-zinc-800" />
          {weekDates.map((dateStr, i) => (
            <div
              key={dateStr}
              className={`border-b border-l border-zinc-200 px-2 py-2 text-center text-xs font-medium dark:border-zinc-800 ${
                dateStr === todayDateStr
                  ? "bg-[#0071e3] text-white dark:bg-[#0a84ff] dark:text-white"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {WEEKDAY_LABELS[i]} {DAY_MONTH_FORMAT.format(new Date(`${dateStr}T12:00:00-05:00`))}
            </div>
          ))}

          <div style={{ height: (HOUR_END - HOUR_START) * HOUR_HEIGHT }}>
            {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
              <div
                key={i}
                style={{ height: HOUR_HEIGHT }}
                className="border-b border-zinc-100 pr-2 text-right text-[10px] text-zinc-400 dark:border-zinc-900"
              >
                {String(HOUR_START + i).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {weekDates.map((dateStr) => (
            <div
              key={dateStr}
              className="relative border-l border-zinc-200 dark:border-zinc-800"
              style={{ height: (HOUR_END - HOUR_START) * HOUR_HEIGHT }}
            >
              {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
                <div
                  key={i}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-b border-zinc-100 dark:border-zinc-900"
                />
              ))}

              {(rowsByDate.get(dateStr) ?? []).map((row) => {
                const start = toBogotaHourMinute(row.startsAt);
                const durationMin = Math.max(
                  15,
                  (new Date(row.endsAt).getTime() - new Date(row.startsAt).getTime()) / 60_000,
                );
                const top = ((start.hour - HOUR_START) * 60 + start.minute) * (HOUR_HEIGHT / 60);
                const height = durationMin * (HOUR_HEIGHT / 60);
                const isSelected = selectedKey === rowKey(row);

                const label =
                  row.source === "crm" ? `${row.contactName}` : row.summary;
                // Los eventos de Google heredan su color real (colorId del
                // evento, o el color por defecto del calendario si no
                // tiene uno propio) — resuelto server-side. Las reservas
                // del CRM usan el color de su estado.
                const colorClass =
                  row.source === "google"
                    ? ""
                    : row.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : row.status === "PRE_RESERVED"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500";
                const inlineColor =
                  row.source === "google"
                    ? { backgroundColor: row.backgroundColor, color: row.foregroundColor }
                    : {};

                if (top + height < 0 || top > (HOUR_END - HOUR_START) * HOUR_HEIGHT) return null;

                return (
                  <button
                    key={rowKey(row)}
                    type="button"
                    onClick={() => setSelectedKey(isSelected ? null : rowKey(row))}
                    style={{ top: Math.max(0, top), height: Math.max(18, height), ...inlineColor }}
                    className={`absolute inset-x-0.5 overflow-hidden rounded px-1 py-0.5 text-left text-[11px] leading-tight ring-1 ring-inset transition-shadow ${colorClass} ${
                      isSelected ? "ring-2 ring-[#0071e3] dark:ring-[#0a84ff]" : "ring-transparent"
                    }`}
                  >
                    <span className="block truncate font-medium">
                      {TIME_FORMAT.format(new Date(row.startsAt))}
                    </span>
                    <span className="block truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedRow && (
        <div className="card p-4">
          {selectedRow.source === "crm" ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {selectedRow.contactName} · {selectedRow.serviceName}
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {TIME_FORMAT.format(new Date(selectedRow.startsAt))} –{" "}
                  {TIME_FORMAT.format(new Date(selectedRow.endsAt))}
                  {" · "}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${RESERVATION_STATUS_STYLES[selectedRow.status]}`}
                  >
                    {RESERVATION_STATUS_LABELS[selectedRow.status]}
                  </span>
                </p>
              </div>
              <ReservationActions
                id={selectedRow.id}
                status={selectedRow.status}
                confirmAction={confirmAction}
                cancelAction={cancelAction}
                generatePaymentLinkAction={generatePaymentLinkAction}
                deleteAction={deleteAction}
                manualPaymentAccounts={manualPaymentAccounts}
              />
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {selectedRow.summary}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {TIME_FORMAT.format(new Date(selectedRow.startsAt))} –{" "}
                {TIME_FORMAT.format(new Date(selectedRow.endsAt))} · Evento externo (Google
                Calendar, no gestionado desde el CRM)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
