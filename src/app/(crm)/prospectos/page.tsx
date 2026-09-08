import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadStatusSelect } from "@/components/crm/lead-status-select";
import { updateLeadStatus } from "./actions";

export default async function ProspectosPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, phone, whatsapp, status, next_follow_up_at, services(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Prospectos
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Pipeline de nuevos contactos hasta que se convierten en clientes.
          </p>
        </div>
        <Link
          href="/prospectos/nuevo"
          className="btn-primary"
        >
          Nuevo prospecto
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Servicio de interés</th>
              <th className="px-4 py-3 font-medium">Próximo seguimiento</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {leads?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                  Todavía no hay prospectos cargados.
                </td>
              </tr>
            )}

            {leads?.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  {lead.name}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {lead.whatsapp || lead.phone || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {lead.services?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {lead.next_follow_up_at ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <LeadStatusSelect
                    id={lead.id}
                    status={lead.status}
                    action={updateLeadStatus}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/prospectos/${lead.id}`}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
