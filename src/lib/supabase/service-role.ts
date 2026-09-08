import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Cliente con service_role — salta RLS por completo. Solo para rutas server
// que atienden llamadas de sistemas externos de confianza sin sesión de
// usuario (Manychat), donde la autenticación ya se verificó a nivel de
// aplicación (token compartido) antes de llegar acá. Nunca importar esto en
// código que corre en el navegador.
export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
