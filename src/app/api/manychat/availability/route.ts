import { NextResponse, type NextRequest } from "next/server";
import { isValidManychatRequest } from "@/lib/manychat-auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getAvailableSlots } from "@/lib/availability";
import { toBogotaHourMinute } from "@/lib/timezone";
import { SINGLE_EVENT_DATE } from "@/lib/manychat-event-scope";

// Consulta de disponibilidad para Manychat: recibe una FECHA (no una hora —
// Manychat le pregunta al cliente qué día quiere, nunca a qué hora, y acá se
// devuelven los horarios reales de ese día). Alcance actual: solo el
// servicio que ya tiene ventanas configuradas (hoy, el Maratón de los
// sábados) — si no hay ninguno con ventanas, o hay más de uno, se devuelve
// un error explícito en vez de adivinar.
export async function GET(request: NextRequest) {
  if (!isValidManychatRequest(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Parámetro 'date' inválido (formato YYYY-MM-DD)" }, { status: 400 });
  }

  // El Maratón es un evento único por ahora (no todos los sábados) — ver
  // src/lib/manychat-event-scope.ts.
  if (date !== SINGLE_EVENT_DATE) {
    return NextResponse.json({ service: null, date, slots: [], error: "not_the_event_date" });
  }

  const supabase = createServiceRoleClient();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price, payment_type, deposit_percentage, pre_reservation_minutes")
    .eq("active", true);

  const withWindows: typeof services = [];
  for (const service of services ?? []) {
    const { count } = await supabase
      .from("service_availability_windows")
      .select("id", { count: "exact", head: true })
      .eq("service_id", service.id);
    if (count && count > 0) withWindows.push(service);
  }

  if (withWindows.length === 0) {
    return NextResponse.json({ error: "No hay servicios con horarios configurados" }, { status: 503 });
  }
  if (withWindows.length > 1) {
    return NextResponse.json(
      { error: "Hay más de un servicio con horarios configurados — falta especificar cuál" },
      { status: 409 },
    );
  }

  const service = withWindows[0];
  const { slots, error } = await getAvailableSlots(service.id, date, supabase);

  return NextResponse.json({
    service: { id: service.id, name: service.name, duration_minutes: service.duration_minutes },
    date,
    slots: slots.map((slot) => {
      const { hour, minute } = toBogotaHourMinute(slot.startsAt);
      return {
        starts_at: slot.startsAt,
        label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      };
    }),
    error,
  });
}
