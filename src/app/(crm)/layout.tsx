import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/crm/sidebar";
import { Topbar } from "@/components/crm/topbar";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar email={user?.email ?? null} />
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-6 dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
