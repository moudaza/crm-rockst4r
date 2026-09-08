// Datos para transferencia manual — alternativa mientras se termina de
// afinar la confirmación automática vía webhook de BOLD. La reserva se
// confirma a mano (botón "Confirmar") una vez verificada la transferencia,
// sin depender de ningún pago registrado en la tabla `payments`.
export const MANUAL_PAYMENT_ACCOUNTS = [
  { method: "Bancolombia", detail: "Ahorros · 53400001670 · Victor Daza" },
  { method: "Nequi", detail: "3214898977 · Victor Daza" },
  { method: "Llave Bre-B", detail: "@victord5367" },
] as const;
