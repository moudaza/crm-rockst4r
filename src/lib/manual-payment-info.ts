import "server-only";

// Datos para transferencia manual — alternativa mientras se termina de
// afinar la confirmación automática vía webhook de BOLD. La reserva se
// confirma a mano (botón "Confirmar") una vez verificada la transferencia,
// sin depender de ningún pago registrado en la tabla `payments`.
//
// Los valores reales (números de cuenta) viven en la variable de entorno
// MANUAL_PAYMENT_ACCOUNTS_JSON, no acá — son datos sensibles que no deben
// quedar en el código fuente del repo. Formato esperado:
// '[{"method":"Bancolombia","detail":"Ahorros · 123 · Nombre"}, ...]'

export type ManualPaymentAccount = { method: string; detail: string };

export function getManualPaymentAccounts(): ManualPaymentAccount[] {
  const raw = process.env.MANUAL_PAYMENT_ACCOUNTS_JSON;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ManualPaymentAccount[];
  } catch {
    return [];
  }
}
