import { ServiceForm } from "@/components/crm/service-form";
import { createService } from "../actions";

export default function NuevoServicioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Nuevo servicio
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Definí el precio, la duración y las condiciones de pago.
        </p>
      </div>

      <ServiceForm action={createService} />
    </div>
  );
}
