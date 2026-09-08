"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ email }: { email: string | null }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-zinc-200 px-6 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        {email && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{email}</span>
        )}
        <button
          onClick={handleLogout}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
