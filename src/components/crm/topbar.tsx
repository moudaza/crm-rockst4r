"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ email }: { email: string | null }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const initial = email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-black/[0.06] bg-white/80 px-6 backdrop-blur-xl dark:border-white/[0.08] dark:bg-black/40">
      {email && (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0071e3] to-[#5ac8fa] text-xs font-semibold text-white">
            {initial}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{email}</span>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
      >
        <LogOut className="h-3.5 w-3.5" strokeWidth={2.25} />
        Cerrar sesión
      </button>
    </header>
  );
}
