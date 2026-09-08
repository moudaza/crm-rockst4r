import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/integrations/google-calendar";

export async function GET() {
  return NextResponse.redirect(getGoogleAuthUrl());
}
