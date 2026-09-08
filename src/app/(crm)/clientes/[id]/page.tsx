import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "@/components/crm/client-form";
import { updateClientRecord } from "../actions";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {client.name}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Editar cliente</p>
      </div>

      <ClientForm action={updateClientRecord.bind(null, id)} client={client} />
    </div>
  );
}
