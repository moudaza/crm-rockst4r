"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots, type AvailableSlot } from "@/lib/availability";

export type ReservationFormState = { error: string | null };

function parseContact(value: string): { lead_id: string | null; client_id: string | null } {
  const [type, id] = value.split(":");
  if (type === "lead" && id) return { lead_id: id, client_id: null };
  if (type === "client" && id) return { lead_id: null, client_id: id };
  return { lead_id: null, client_id: null };
}

export async function getAvailableSlotsAction(
  serviceId: string,
  date: string,
): Promise<{ slots: AvailableSlot[]; error: string | null }> {
  if (!serviceId || !date) return { slots: [], error: null };
  return getAvailableSlots(serviceId, date);
}

export async function createReservation(
  _prevState: ReservationFormState,
  formData: FormData,
): Promise<ReservationFormState> {
  const serviceId = String(formData.get("service_id") ?? "");
  const contact = String(formData.get("contact") ?? "");
  const startsAtValue = String(formData.get("starts_at") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!serviceId) return { error: "Elegí un servicio." };
  const { lead_id, client_id } = parseContact(contact);
  if (!lead_id && !client_id) return { error: "Elegí un prospecto o cliente." };
  if (!startsAtValue) return { error: "Elegí un horario disponible." };

  const startsAt = new Date(startsAtValue);
  if (Number.isNaN(startsAt.getTime())) return { error: "Horario inválido." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_pre_reservation", {
    p_service_id: serviceId,
    p_starts_at: startsAt.toISOString(),
    p_lead_id: lead_id ?? undefined,
    p_client_id: client_id ?? undefined,
    p_notes: notes ?? undefined,
  });

  if (error) {
    if (error.code === "23P01") {
      return { error: "Ese horario ya está ocupado. Elegí otro." };
    }
    return { error: error.message };
  }

  revalidatePath("/calendario");
  redirect("/calendario");
}

export async function confirmReservation(id: string) {
  const supabase = await createClient();
  await supabase
    .from("reservations")
    .update({ status: "CONFIRMED", confirmed_at: new Date().toISOString(), expires_at: null })
    .eq("id", id);
  revalidatePath("/calendario");
}

export async function cancelReservation(id: string) {
  const supabase = await createClient();
  await supabase
    .from("reservations")
    .update({ status: "CANCELLED", cancelled_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/calendario");
}
