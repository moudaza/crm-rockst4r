import "server-only";
import crypto from "node:crypto";

// Integración con BOLD (pagos en línea, Colombia). Los links de pago los
// genera el staff desde una reserva PRE_RESERVED; la confirmación real
// SOLO llega por el webhook (nunca por el redirect del navegador tras
// pagar) — ver src/app/api/webhooks/bold/route.ts.

const BOLD_LINK_API_URL = "https://integrations.api.bold.co/online/link/v1";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export type CreatePaymentLinkResult = { paymentLinkId: string; checkoutUrl: string };

/** Crea un link de pago de monto cerrado en BOLD. `amount` en la unidad
 * mínima de la moneda (COP no tiene decimales, así que son pesos enteros). */
export async function createBoldPaymentLink(params: {
  amount: number;
  currency?: "COP" | "USD";
  reference: string;
  description: string;
  payerEmail?: string;
}): Promise<CreatePaymentLinkResult> {
  const response = await fetch(BOLD_LINK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `x-api-key ${requiredEnv("BOLD_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount_type: "CLOSE",
      amount: {
        currency: params.currency ?? "COP",
        total_amount: params.amount,
        tip_amount: 0,
      },
      reference: params.reference,
      description: params.description,
      payer_email: params.payerEmail,
    }),
  });

  if (!response.ok) {
    throw new Error(`BOLD rechazó la creación del link de pago: ${await response.text()}`);
  }

  const data = (await response.json()) as {
    payload?: { payment_link: string; url: string };
    errors?: unknown[];
  };

  if (!data.payload) {
    throw new Error(`BOLD no devolvió un link de pago: ${JSON.stringify(data.errors)}`);
  }

  return { paymentLinkId: data.payload.payment_link, checkoutUrl: data.payload.url };
}

/** Verifica la firma HMAC-SHA256 del webhook de BOLD: hex(HMAC-SHA256(llave
 * secreta del comercio, base64(cuerpo crudo))) debe igualar el header
 * `x-bold-signature`. Se usa el cuerpo crudo (antes de parsear JSON) porque
 * cualquier reserialización puede cambiar el resultado del hash. */
export function verifyBoldWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const secret = requiredEnv("BOLD_WEBHOOK_SECRET");
  const bodyBase64 = Buffer.from(rawBody, "utf8").toString("base64");
  const expected = crypto.createHmac("sha256", secret).update(bodyBase64).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signatureHeader, "hex");
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export type BoldWebhookEventType =
  | "SALE_APPROVED"
  | "SALE_REJECTED"
  | "VOID_APPROVED"
  | "VOID_REJECTED";

export type BoldWebhookPayload = {
  id: string;
  type: BoldWebhookEventType;
  subject: string;
  data: {
    payment_id?: string;
    // La referencia que nosotros generamos al crear el link (nuestro
    // `payments.reference`) viaja en data.metadata.reference — confirmado
    // contra un webhook real (2026-09-08), no en data.external_reference
    // como sugería la documentación pública.
    metadata?: { reference?: string };
    [key: string]: unknown;
  };
};
