"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ReservationFormState } from "@/app/(crm)/calendario/actions";
import type { Tables } from "@/lib/supabase/database.types";
import { formatDuration } from "@/lib/format";

type Action = (
  prevState: ReservationFormState,
  formData: FormData,
) => Promise<ReservationFormState>;

export function ReservationForm({
  action,
  services,
  leads,
  clients,
}: {
  action: Action;
  services: Pick<Tables<"services">, "id" | "name" | "duration_minutes" | "pre_reservation_minutes">[];
  leads: Pick<Tables<"leads">, "id" | "name">[];
  clients: Pick<Tables<"clients">, "id" | "name">[];
}) {
  const [state, formAction, pending] = useActionState<ReservationFormState, FormData>(
    action,
    { error: null },
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Field label="Servicio" htmlFor="service_id">
        <select id="service_id" name="service_id" required className="input">
          <option value="">Elegí un servicio</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({formatDuration(service.duration_minutes)}, pre-reserva{" "}
              {service.pre_reservation_minutes} min)
            </option>
          ))}
        </select>
      </Field>

      <Field label="Prospecto o cliente" htmlFor="contact">
        <select id="contact" name="contact" required className="input">
          <option value="">Elegí un contacto</option>
          {leads.length > 0 && (
            <optgroup label="Prospectos">
              {leads.map((lead) => (
                <option key={lead.id} value={`lead:${lead.id}`}>
                  {lead.name}
                </option>
              ))}
            </optgroup>
          )}
          {clients.length > 0 && (
            <optgroup label="Clientes">
              {clients.map((client) => (
                <option key={client.id} value={`client:${client.id}`}>
                  {client.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha" htmlFor="date">
          <input id="date" name="date" type="date" required className="input" />
        </Field>
        <Field label="Hora" htmlFor="time">
          <input id="time" name="time" type="time" required className="input" />
        </Field>
      </div>

      <Field label="Notas" htmlFor="notes">
        <textarea id="notes" name="notes" rows={3} className="input" />
      </Field>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "Reservando..." : "Pre-reservar"}
        </button>
        <Link
          href="/calendario"
          className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
