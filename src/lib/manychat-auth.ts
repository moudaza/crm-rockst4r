import "server-only";
import type { NextRequest } from "next/server";

// Token compartido que nosotros definimos y le damos a Manychat para
// configurar en el header de sus "External Request" — a diferencia de BOLD,
// acá la llave la generamos nosotros, no la emite un tercero.
export function isValidManychatRequest(request: NextRequest): boolean {
  const expected = process.env.MANYCHAT_API_KEY;
  if (!expected) return false;

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  return token === expected;
}
