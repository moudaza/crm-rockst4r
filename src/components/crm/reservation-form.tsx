"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import type { ReservationFormState } from "@/app/(crm)/calendario/actions";
import { getAvailableSlotsAction } from "@/app/(crm)/calendario/actions";
import type { Tables } from "@/lib/supabase/database.types";
import type { AvailableSlot } from "@/lib/availability";
import { formatDuration } from "@/lib/format";

const TIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

const SLOT_ERROR_MESSAGES: Record<string, string> = {
  service_not_found: "Ese servicio no existe o está inactivo.",
  no_windows_for_day: "El servicio no tiene horarios configurados para ese día.",
  google_not_connected:
    "Google Calendar no está conectado — conectalo en Configuración para ver disponibilidad real.",
  google_api_error: "No se pudo consultar Google Calendar. Intentá de nuevo.",
};

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

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [isLoadingSlots, startLoadingSlots] = useTransition();

  useEffect(() => {
    if (!serviceId || !date) return;
    startLoadingSlots(async () => {
      const result = await getAvailableSlotsAction(serviceId, date);
      setSlots(result.slots);
      setSlotsError(result.error);
    });
  }, [serviceId, date]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <input type="hidden" name="starts_at" value={selectedSlot?.startsAt ?? ""} />

      <Field label="Servicio" htmlFor="service_id">
        <select
          id="service_id"
          name="service_id"
          required
          value={serviceId}
          onChange={(e) => {
            setServiceId(e.target.value);
            setSelectedSlot(null);
          }}
          className="input"
        >
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

      <Field label="Fecha" htmlFor="date">
        <input
          id="date"
          name="date"
          type="date"
          required
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedSlot(null);
          }}
          className="input"
        />
      </Field>

      {serviceId && date && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Horario disponible
          </span>

          {isLoadingSlots ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Consultando disponibilidad...</p>
          ) : slotsError ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {SLOT_ERROR_MESSAGES[slotsError] ?? slotsError}
            </p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No hay turnos disponibles ese día.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-md border px-2 py-1.5 text-sm transition-colors ${
                    selectedSlot?.startsAt === slot.startsAt
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
                  }`}
                >
                  {TIME_FORMAT.format(new Date(slot.startsAt))}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Field label="Notas" htmlFor="notes">
        <textarea id="notes" name="notes" rows={3} className="input" />
      </Field>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || !selectedSlot}
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
