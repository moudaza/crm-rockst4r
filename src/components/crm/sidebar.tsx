"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-white/80 backdrop-blur-xl dark:bg-black/40">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#0071e3] to-[#5ac8fa] text-sm font-bold text-white shadow-sm">
          R
        </span>
        <span>
          <span className="block text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            ROCKST4R
          </span>
          <span className="block text-[11px] font-medium text-zinc-400">CRM</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black/[0.05] text-zinc-900 dark:bg-white/10 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-black/[0.03] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-50"
              }`}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] shadow-sm"
                style={{ backgroundColor: item.color }}
              >
                <Icon className="h-4 w-4 text-white" strokeWidth={2.25} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
