"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ClientFormState } from "@/app/(crm)/clientes/actions";
import type { Tables } from "@/lib/supabase/database.types";

type Action = (
  prevState: ClientFormState,
  formData: FormData,
) => Promise<ClientFormState>;

export function ClientForm({
  action,
  client,
}: {
  action: Action;
  client?: Tables<"clients">;
}) {
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(
    action,
    { error: null },
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Field label="Nombre" htmlFor="name">
        <input id="name" name="name" required defaultValue={client?.name} className="input" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Teléfono" htmlFor="phone">
          <input id="phone" name="phone" defaultValue={client?.phone ?? ""} className="input" />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp">
          <input
            id="whatsapp"
            name="whatsapp"
            defaultValue={client?.whatsapp ?? ""}
            className="input"
          />
        </Field>
      </div>

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={client?.email ?? ""}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Documento" htmlFor="document">
          <input
            id="document"
            name="document"
            defaultValue={client?.document ?? ""}
            className="input"
          />
        </Field>
        <Field label="Dirección" htmlFor="address">
          <input
            id="address"
            name="address"
            defaultValue={client?.address ?? ""}
            className="input"
          />
        </Field>
      </div>

      <Field label="Notas" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={client?.notes ?? ""}
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
          className="btn-primary"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
        <Link
          href="/clientes"
          className="btn-secondary"
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
