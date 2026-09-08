import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Páginas legales: públicas siempre, sin importar si hay sesión o no (no
  // redirigen en ningún sentido) — a diferencia de /login, que sí redirige.
  const ALWAYS_PUBLIC_ROUTES = ["/privacidad", "/terminos"];
  if (ALWAYS_PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /update-password requiere sesión (llega ahí vía el link de recovery),
  // por eso no forma parte de las rutas públicas.
  const PUBLIC_ONLY_ROUTES = ["/login", "/reset-password"];
  const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.includes(
    request.nextUrl.pathname,
  );

  if (!user && !isPublicOnlyRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isPublicOnlyRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
