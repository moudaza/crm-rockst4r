import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForConnection } from "@/lib/integrations/google-calendar";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const googleError = url.searchParams.get("error");

  const redirectTo = (params: Record<string, string>) => {
    const target = new URL("/configuracion", url.origin);
    Object.entries(params).forEach(([key, value]) => target.searchParams.set(key, value));
    return NextResponse.redirect(target);
  };

  if (googleError) {
    return redirectTo({ google_calendar_error: googleError });
  }
  if (!code) {
    return redirectTo({ google_calendar_error: "missing_code" });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo({ google_calendar_error: "not_authenticated" });
  }

  try {
    await exchangeCodeForConnection(code, user.id);
  } catch (error) {
    return redirectTo({
      google_calendar_error: error instanceof Error ? error.message : "unknown_error",
    });
  }

  return redirectTo({ google_calendar_connected: "1" });
}
