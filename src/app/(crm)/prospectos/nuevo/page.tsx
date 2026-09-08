import { createClient } from "@/lib/supabase/server";
import { LeadForm } from "@/components/crm/lead-form";
import { createLead } from "../actions";

export default async function NuevoProspectoPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Nuevo prospecto
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Registrá un nuevo contacto para empezar a hacerle seguimiento.
        </p>
      </div>

      <LeadForm action={createLead} services={services ?? []} />
    </div>
  );
}
