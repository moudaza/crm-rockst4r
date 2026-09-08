"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export type ClientFormState = { error: string | null };

function parseClientForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    document: String(formData.get("document") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createClientRecord(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const values = parseClientForm(formData);
  if (!values.name) return { error: "El nombre es obligatorio." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").insert(values);

  if (error) return { error: "No se pudo crear el cliente." };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateClientRecord(
  id: string,
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const values = parseClientForm(formData);
  if (!values.name) return { error: "El nombre es obligatorio." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").update(values).eq("id", id);

  if (error) return { error: "No se pudo actualizar el cliente." };

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect("/clientes");
}
