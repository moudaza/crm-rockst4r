"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ServiceFormState = { error: string | null };

function parseServiceForm(formData: FormData) {
  const paymentType = formData.get("payment_type") === "DEPOSIT" ? "DEPOSIT" : "FULL";
  const depositPercentageRaw = formData.get("deposit_percentage");

  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    duration_minutes: Number(formData.get("duration_minutes")),
    price: Number(formData.get("price")),
    payment_type: paymentType as "FULL" | "DEPOSIT",
    deposit_percentage:
      paymentType === "DEPOSIT" && depositPercentageRaw
        ? Number(depositPercentageRaw)
        : null,
    pre_reservation_minutes: Number(formData.get("pre_reservation_minutes") || 10),
  };
}

function validateService(values: ReturnType<typeof parseServiceForm>) {
  if (!values.name) return "El nombre es obligatorio.";
  if (!values.duration_minutes || values.duration_minutes <= 0)
    return "La duración debe ser mayor a 0.";
  if (!Number.isFinite(values.price) || values.price < 0)
    return "El precio no puede ser negativo.";
  if (values.payment_type === "DEPOSIT" && !values.deposit_percentage)
    return "Indicá el porcentaje de depósito.";
  if (!values.pre_reservation_minutes || values.pre_reservation_minutes <= 0)
    return "Los minutos de pre-reserva deben ser mayores a 0.";
  return null;
}

export async function createService(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const values = parseServiceForm(formData);
  const validationError = validateService(values);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { error } = await supabase.from("services").insert(values);

  if (error) return { error: "No se pudo crear el servicio." };

  revalidatePath("/servicios");
  redirect("/servicios");
}

export async function updateService(
  id: string,
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const values = parseServiceForm(formData);
  const validationError = validateService(values);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { error } = await supabase.from("services").update(values).eq("id", id);

  if (error) return { error: "No se pudo actualizar el servicio." };

  revalidatePath("/servicios");
  redirect("/servicios");
}

export async function toggleServiceActive(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("services").update({ active }).eq("id", id);
  revalidatePath("/servicios");
}
