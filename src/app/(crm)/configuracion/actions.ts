"use server";

import { revalidatePath } from "next/cache";
import { disconnectGoogleCalendar } from "@/lib/integrations/google-calendar";

export async function disconnectGoogleCalendarAction() {
  await disconnectGoogleCalendar();
  revalidatePath("/configuracion");
}
