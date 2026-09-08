"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { LeadFormState } from "@/app/(crm)/prospectos/actions";
import type { Tables } from "@/lib/supabase/database.types";

type Action = (
  prevState: LeadFormState,
  formData: FormData,
) => Promise<LeadFormState>;

export function LeadForm({
  action,
  lead,
  services,
}: {
  action: Action;
  lead?: Tables<"leads">;
  services: Pick<Tables<"services">, "id" | "name">[];
}) {
  const [state, formAction, pending] = useActionState<LeadFormState, FormData>(
    action,
    { error: null },
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Field label="Nombre" htmlFor="name">
        <input id="name" name="name" required defaultValue={lead?.name} className="input" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Teléfono" htmlFor="phone">
          <input id="phone" name="phone" defaultValue={lead?.phone ?? ""} className="input" />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp">
          <input
            id="whatsapp"
            name="whatsapp"
            defaultValue={lead?.whatsapp ?? ""}
            className="input"
          />
        </Field>
      </div>

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={lead?.email ?? ""}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Servicio de interés" htmlFor="service_id">
          <select
            id="service_id"
            name="service_id"
            defaultValue={lead?.service_id ?? ""}
            className="input"
          >
            <option value="">Sin especificar</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fuente" htmlFor="source">
          <input
            id="source"
            name="source"
            placeholder="Instagram, referido, web..."
            defaultValue={lead?.source ?? ""}
            className="input"
          />
        </Field>
      </div>

      <Field label="Próximo seguimiento" htmlFor="next_follow_up_at">
        <input
          id="next_follow_up_at"
          name="next_follow_up_at"
          type="date"
          defaultValue={lead?.next_follow_up_at ?? ""}
          className="input"
        />
      </Field>

      <Field label="Notas" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={lead?.notes ?? ""}
          className="input"
        />
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
          {pending ? "Guardando..." : "Guardar"}
        </button>
        <Link
          href="/prospectos"
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
