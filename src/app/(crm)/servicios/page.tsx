import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDuration } from "@/lib/format";
import { ToggleActiveButton } from "@/components/crm/toggle-active-button";
import { toggleServiceActive } from "./actions";

export default async function ServiciosPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Servicios
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Catálogo de servicios y sus condiciones de pago.
          </p>
        </div>
        <Link
          href="/servicios/nuevo"
          className="btn-primary"
        >
          Nuevo servicio
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Duración</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Pre-reserva</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {services?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                  Todavía no hay servicios cargados.
                </td>
              </tr>
            )}

            {services?.map((service) => (
              <tr
                key={service.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  {service.name}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {formatDuration(service.duration_minutes)}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {formatCurrency(service.price)}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {service.payment_type === "FULL"
                    ? "100%"
                    : `Depósito ${service.deposit_percentage}%`}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {service.pre_reservation_minutes} min
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      service.active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500"
                    }`}
                  >
                    {service.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/servicios/${service.id}`}
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      Editar
                    </Link>
                    <ToggleActiveButton
                      id={service.id}
                      active={service.active}
                      action={toggleServiceActive}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
