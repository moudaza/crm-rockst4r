"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots, type AvailableSlot } from "@/lib/availability";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/integrations/google-calendar";

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
  const newContactName = String(formData.get("new_contact_name") ?? "").trim();
  const startsAtValue = String(formData.get("starts_at") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!serviceId) return { error: "Elegí un servicio." };
  if (!startsAtValue) return { error: "Elegí un horario disponible." };

  const startsAt = new Date(startsAtValue);
  if (Number.isNaN(startsAt.getTime())) return { error: "Horario inválido." };

  const supabase = await createClient();

  let lead_id: string | null = null;
  let client_id: string | null = null;

  if (contact === "__new__") {
    if (!newContactName) return { error: "Escribí el nombre del contacto." };
    const { data: newLead, error: newLeadError } = await supabase
      .from("leads")
      .insert({ name: newContactName, source: "Reserva directa (CRM)" })
      .select("id")
      .single();
    if (newLeadError) return { error: newLeadError.message };
    lead_id = newLead.id;
  } else {
    const parsed = parseContact(contact);
    lead_id = parsed.lead_id;
    client_id = parsed.client_id;
    if (!lead_id && !client_id) return { error: "Elegí un prospecto o cliente." };
  }

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

  const { data: reservation } = await supabase
    .from("reservations")
    .select("starts_at, ends_at, notes, services(name), leads(name), clients(name)")
    .eq("id", id)
    .single();

  let googleEventId: string | null = null;
  if (reservation) {
    const contactName = reservation.clients?.name ?? reservation.leads?.name ?? "Cliente";
    const serviceName = reservation.services?.name ?? "Sesión";
    const created = await createCalendarEvent({
      summary: `${serviceName} — ${contactName}`,
      description: reservation.notes ?? undefined,
      startsAt: reservation.starts_at,
      endsAt: reservation.ends_at,
    });
    googleEventId = created?.id ?? null;
  }

  await supabase
    .from("reservations")
    .update({
      status: "CONFIRMED",
      confirmed_at: new Date().toISOString(),
      expires_at: null,
      google_event_id: googleEventId,
    })
    .eq("id", id);
  revalidatePath("/calendario");
}

export async function cancelReservation(id: string) {
  const supabase = await createClient();

  const { data: reservation } = await supabase
    .from("reservations")
    .select("google_event_id")
    .eq("id", id)
    .single();

  if (reservation?.google_event_id) {
    await deleteCalendarEvent(reservation.google_event_id);
  }

  await supabase
    .from("reservations")
    .update({ status: "CANCELLED", cancelled_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/calendario");
}
