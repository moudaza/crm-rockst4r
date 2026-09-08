import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceForm } from "@/components/crm/service-form";
import { updateService } from "../actions";

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (!service) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Editar servicio
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{service.name}</p>
      </div>

      <ServiceForm action={updateService.bind(null, id)} service={service} />
    </div>
  );
}
