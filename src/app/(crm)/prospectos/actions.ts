"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/lead-status";

export type LeadFormState = { error: string | null };

function parseLeadForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    service_id: String(formData.get("service_id") ?? "") || null,
    source: String(formData.get("source") ?? "").trim() || null,
    next_follow_up_at: String(formData.get("next_follow_up_at") ?? "") || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createLead(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const values = parseLeadForm(formData);
  if (!values.name) return { error: "El nombre es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert(values);

  if (error) return { error: "No se pudo crear el prospecto." };

  revalidatePath("/prospectos");
  redirect("/prospectos");
}

export async function updateLead(
  id: string,
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const values = parseLeadForm(formData);
  if (!values.name) return { error: "El nombre es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update(values).eq("id", id);

  if (error) return { error: "No se pudo actualizar el prospecto." };

  revalidatePath("/prospectos");
  revalidatePath(`/prospectos/${id}`);
  redirect("/prospectos");
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = await createClient();
  await supabase
    .from("leads")
    .update({
      status,
      last_contacted_at:
        status === "CONTACTADO" ? new Date().toISOString() : undefined,
    })
    .eq("id", id);
  revalidatePath("/prospectos");
}

export async function convertLeadToClient(id: string) {
  const supabase = await createClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, name, phone, whatsapp, email, converted_to_client_id")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return { error: "No se encontró el prospecto." };
  }

  if (lead.converted_to_client_id) {
    redirect(`/clientes/${lead.converted_to_client_id}`);
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      name: lead.name,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      email: lead.email,
    })
    .select("id")
    .single();

  if (clientError || !client) {
    return { error: "No se pudo crear el cliente." };
  }

  await supabase
    .from("leads")
    .update({ status: "CLIENTE", converted_to_client_id: client.id })
    .eq("id", id);

  revalidatePath("/prospectos");
  revalidatePath("/clientes");
  redirect(`/clientes/${client.id}`);
}
