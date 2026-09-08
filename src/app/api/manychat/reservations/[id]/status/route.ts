import { NextResponse, type NextRequest } from "next/server";
import { isValidManychatRequest } from "@/lib/manychat-auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Manychat consulta esto después de mandar el link de pago (por ejemplo,
// esperando los 10 minutos de la pre-reserva) para saber si confirmar el
// éxito de la reserva al cliente, o si ofrecerle la transferencia manual
// como alternativa porque el pago falló/expiró.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isValidManychatRequest(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("id, status, starts_at, ends_at, services(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !reservation) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    reservation_id: reservation.id,
    status: reservation.status,
    starts_at: reservation.starts_at,
    ends_at: reservation.ends_at,
    service_name: reservation.services?.name ?? null,
  });
}
