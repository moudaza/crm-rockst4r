import type { Enums } from "@/lib/supabase/database.types";

export type ReservationStatus = Enums<"reservation_status">;

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PRE_RESERVED: "Pre-reservada",
  CONFIRMED: "Confirmada",
  EXPIRED: "Vencida",
  CANCELLED: "Cancelada",
};

export const RESERVATION_STATUS_STYLES: Record<ReservationStatus, string> = {
  PRE_RESERVED:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  CONFIRMED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  EXPIRED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500",
  CANCELLED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500",
};
