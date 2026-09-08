import { NextResponse, type NextRequest } from "next/server";
import { isValidManychatRequest } from "@/lib/manychat-auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createBoldPaymentLink } from "@/lib/integrations/bold";
import { getManualPaymentAccounts } from "@/lib/manual-payment-info";

// Crea la pre-reserva + el link de pago de BOLD en un solo paso, para que
// Manychat se lo mande al cliente de una — la reserva NO queda confirmada
// acá, solo cuando el webhook de BOLD confirme el pago (ver
// /api/webhooks/bold). Devuelve también las cuentas de transferencia manual
// como respaldo si el pago con BOLD falla.
export async function POST(request: NextRequest) {
  if (!isValidManychatRequest(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    starts_at?: string;
    contact_name?: string;
    whatsapp?: string;
  } | null;

  const startsAtValue = body?.starts_at;
  const contactName = body?.contact_name?.trim();
  const whatsapp = body?.whatsapp?.trim();

  if (!startsAtValue || !contactName || !whatsapp) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: starts_at, contact_name, whatsapp" },
      { status: 400 },
    );
  }

  const startsAt = new Date(startsAtValue);
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "starts_at inválido" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, price, payment_type, deposit_percentage")
    .eq("active", true);

  const withWindows: typeof services = [];
  for (const service of services ?? []) {
    const { count } = await supabase
      .from("service_availability_windows")
      .select("id", { count: "exact", head: true })
      .eq("service_id", service.id);
    if (count && count > 0) withWindows.push(service);
  }

  if (withWindows.length !== 1) {
    return NextResponse.json(
      { error: "No se pudo determinar el servicio (debe haber exactamente uno con horarios configurados)" },
      { status: 503 },
    );
  }
  const service = withWindows[0];

  let { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("whatsapp", whatsapp)
    .maybeSingle();

  if (!lead) {
    const { data: newLead, error: leadError } = await supabase
      .from("leads")
      .insert({ name: contactName, whatsapp, source: "Manychat" })
      .select("id")
      .single();
    if (leadError) return NextResponse.json({ error: leadError.message }, { status: 500 });
    lead = newLead;
  }

  const { data: reservation, error: reservationError } = await supabase.rpc("create_pre_reservation", {
    p_service_id: service.id,
    p_starts_at: startsAt.toISOString(),
    p_lead_id: lead.id,
  });

  if (reservationError) {
    if (reservationError.code === "23P01") {
      return NextResponse.json({ error: "Ese horario ya está ocupado" }, { status: 409 });
    }
    return NextResponse.json({ error: reservationError.message }, { status: 500 });
  }

  const amount =
    service.payment_type === "DEPOSIT"
      ? Math.round((service.price * (service.deposit_percentage ?? 0)) / 100)
      : Math.round(service.price);

  const reference = `res-${reservation.id}-${Date.now()}`;

  let link;
  try {
    link = await createBoldPaymentLink({
      amount,
      currency: "COP",
      reference,
      description: `${service.name} — ${contactName}`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        reservation_id: reservation.id,
        expires_at: reservation.expires_at,
        error: err instanceof Error ? err.message : "No se pudo crear el link de pago",
        manual_payment_accounts: getManualPaymentAccounts(),
      },
      { status: 502 },
    );
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    reservation_id: reservation.id,
    reference,
    bold_payment_link_id: link.paymentLinkId,
    amount,
    currency: "COP",
    checkout_url: link.checkoutUrl,
  });
  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  return NextResponse.json({
    reservation_id: reservation.id,
    starts_at: reservation.starts_at,
    ends_at: reservation.ends_at,
    expires_at: reservation.expires_at,
    checkout_url: link.checkoutUrl,
    amount,
    currency: "COP",
    manual_payment_accounts: getManualPaymentAccounts(),
  });
}
