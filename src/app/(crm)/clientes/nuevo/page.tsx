import { ClientForm } from "@/components/crm/client-form";
import { createClientRecord } from "../actions";

export default function NuevoClientePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Nuevo cliente
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Para prospectos que aún no fueron contactados, usá Prospectos en vez
          de esto — este alta es para clientes que ya existen fuera del CRM.
        </p>
      </div>

      <ClientForm action={createClientRecord} />
    </div>
  );
}
