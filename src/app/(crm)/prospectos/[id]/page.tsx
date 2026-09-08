import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadForm } from "@/components/crm/lead-form";
import { ConvertToClientButton } from "@/components/crm/convert-to-client-button";
import { updateLead, convertLeadToClient } from "../actions";

export default async function EditarProspectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: lead }, { data: services }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase.from("services").select("id, name").eq("active", true).order("name"),
  ]);

  if (!lead) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {lead.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Editar prospecto</p>
        </div>

        {lead.converted_to_client_id ? (
          <Link
            href={`/clientes/${lead.converted_to_client_id}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Ver cliente →
          </Link>
        ) : (
          <ConvertToClientButton id={lead.id} action={convertLeadToClient} />
        )}
      </div>

      <LeadForm
        action={updateLead.bind(null, id)}
        lead={lead}
        services={services ?? []}
      />
    </div>
  );
}
