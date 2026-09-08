// El Maratón es, por ahora, un evento ÚNICO (no recurrente): sábado 12 de
// septiembre de 2026 — confirmado explícitamente por el usuario (2026-09-08).
// service_availability_windows está modelada por día de la semana
// (day_of_week=6 = cualquier sábado), así que sin este límite el flujo de
// Manychat ofrecería erróneamente TODOS los sábados futuros, no solo este.
//
// Si más adelante se anuncian más Maratones en fechas puntuales (confirmado
// que no serían "todos los sábados"), esto debería reemplazarse por una
// tabla de fechas de evento válidas en vez de una constante.
export const SINGLE_EVENT_DATE = "2026-09-12";
