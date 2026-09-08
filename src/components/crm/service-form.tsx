"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ServiceFormState } from "@/app/(crm)/servicios/actions";
import type { Tables } from "@/lib/supabase/database.types";

type Action = (
  prevState: ServiceFormState,
  formData: FormData,
) => Promise<ServiceFormState>;

export function ServiceForm({
  action,
  service,
}: {
  action: Action;
  service?: Tables<"services">;
}) {
  const [state, formAction, pending] = useActionState<ServiceFormState, FormData>(
    action,
    { error: null },
  );
  const [paymentType, setPaymentType] = useState<"FULL" | "DEPOSIT">(
    service?.payment_type ?? "FULL",
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Field label="Nombre" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          defaultValue={service?.name}
          className="input"
        />
      </Field>

      <Field label="Descripción" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={service?.description ?? ""}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Duración (minutos)" htmlFor="duration_minutes">
          <input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={1}
            required
            defaultValue={service?.duration_minutes}
            className="input"
          />
        </Field>

        <Field label="Precio (COP)" htmlFor="price">
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="1"
            required
            defaultValue={service?.price}
            className="input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipo de pago" htmlFor="payment_type">
          <select
            id="payment_type"
            name="payment_type"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as "FULL" | "DEPOSIT")}
            className="input"
          >
            <option value="FULL">Pago completo (100%)</option>
            <option value="DEPOSIT">Depósito parcial</option>
          </select>
        </Field>

        <Field label="Pre-reserva (minutos)" htmlFor="pre_reservation_minutes">
          <input
            id="pre_reservation_minutes"
            name="pre_reservation_minutes"
            type="number"
            min={1}
            required
            defaultValue={service?.pre_reservation_minutes ?? 10}
            className="input"
          />
        </Field>
      </div>

      {paymentType === "DEPOSIT" && (
        <Field label="Porcentaje de depósito (%)" htmlFor="deposit_percentage">
          <input
            id="deposit_percentage"
            name="deposit_percentage"
            type="number"
            min={1}
            max={100}
            required
            defaultValue={service?.deposit_percentage ?? 50}
            className="input"
          />
        </Field>
      )}

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
          href="/servicios"
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
