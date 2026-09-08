import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // /api/* queda afuera: las rutas ahí (OAuth de Google, webhook de BOLD)
  // manejan su propia autenticación/verificación — el webhook de BOLD en
  // particular llega sin cookies de sesión, así que el redirect a /login
  // rompería la confirmación de pagos si pasara por acá.
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
