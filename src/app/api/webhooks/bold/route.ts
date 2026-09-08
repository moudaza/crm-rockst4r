import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { verifyBoldWebhookSignature, type BoldWebhookPayload } from "@/lib/integrations/bold";
import { createCalendarEvent } from "@/lib/integrations/google-calendar";

// Webhook de BOLD: la ÚNICA fuente confiable de confirmación de pago (nunca
// el redirect del navegador tras pagar). Debe responder 200 en menos de 2
// segundos o BOLD reintenta (15min, 1h, 4h, 8h, 24h) hasta 5 veces.
// process_bold_webhook_event() en Postgres es idempotente por diseño: solo
// transiciona pagos que sigan en PENDING, así que reintentos no duplican
// nada — está bien tardarse en devolver 200 mientras la firma sea válida.

const EVENT_TO_STATUS = {
  SALE_APPROVED: "APPROVED",
  SALE_REJECTED: "REJECTED",
  VOID_APPROVED: "VOID_APPROVED",
  VOID_REJECTED: "VOID_REJECTED",
} as const;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-bold-signature");

  if (!verifyBoldWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as BoldWebhookPayload;
  // DEBUG TEMPORAL: confirmar el nombre real del campo que trae nuestra
  // referencia — quitar una vez confirmado.
  console.log("[bold-webhook] raw body:", rawBody);
  const status = EVENT_TO_STATUS[payload.type];

  if (!status) {
    // Evento que no nos interesa — se confirma igual para que BOLD no reintente.
    return NextResponse.json({ ok: true });
  }

  const reference = payload.data?.external_reference;
  if (!reference) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase.rpc("process_bold_webhook_event", {
    p_reference: reference,
    p_bold_transaction_id: payload.data?.payment_id ?? payload.subject ?? null,
    p_status: status,
    p_raw_payload: payload as unknown as Json,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const confirmed = rows?.[0];
  if (confirmed?.needs_google_event) {
    try {
      const created = await createCalendarEvent({
        summary: `${confirmed.service_name} — ${confirmed.contact_name}`,
        description: confirmed.notes ?? undefined,
        startsAt: confirmed.starts_at,
        endsAt: confirmed.ends_at,
      });
      if (created) {
        await supabase.rpc("set_reservation_google_event", {
          p_reservation_id: confirmed.reservation_id,
          p_google_event_id: created.id,
        });
      }
    } catch {
      // La reserva ya quedó CONFIRMED en el CRM (fuente de verdad). Si
      // Google falla acá, el evento simplemente no se refleja — mismo
      // criterio que la confirmación manual.
    }
  }

  return NextResponse.json({ ok: true });
}
