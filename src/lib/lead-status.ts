import type { Enums } from "@/lib/supabase/database.types";

export type LeadStatus = Enums<"lead_status">;

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "NUEVO",
  "CONTACTADO",
  "COTIZACION_ENVIADA",
  "EN_NEGOCIACION",
  "RESERVADO",
  "CLIENTE",
  "PERDIDO",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  COTIZACION_ENVIADA: "Cotización enviada",
  EN_NEGOCIACION: "En negociación",
  RESERVADO: "Reservado",
  CLIENTE: "Cliente",
  PERDIDO: "Perdido",
};
