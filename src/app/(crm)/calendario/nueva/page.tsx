import { createClient } from "@/lib/supabase/server";
import { ReservationForm } from "@/components/crm/reservation-form";
import { createReservation } from "../actions";

export default async function NuevaReservaPage() {
  const supabase = await createClient();
  const [{ data: services }, { data: leads }, { data: clients }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, duration_minutes, pre_reservation_minutes")
      .eq("active", true)
      .order("name"),
    supabase.from("leads").select("id, name").neq("status", "CLIENTE").order("name"),
    supabase.from("clients").select("id, name").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Nueva reserva
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Se crea como pre-reserva y bloquea el horario hasta que venza el
          tiempo configurado en el servicio.
        </p>
      </div>

      <ReservationForm
        action={createReservation}
        services={services ?? []}
        leads={leads ?? []}
        clients={clients ?? []}
      />
    </div>
  );
}
