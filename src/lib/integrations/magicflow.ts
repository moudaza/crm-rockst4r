import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente de SOLO LECTURA hacia el proyecto Supabase de MagicFlow
// (tareas.bymoudaza.workers.dev). Usa la secret key porque las tablas de
// MagicFlow tienen RLS pensado para su propia app — este CRM no participa de
// esa autenticación, así que necesita bypassear RLS para leer.
//
// REGLA: nunca hacer insert/update/delete acá. Solo select. MagicFlow sigue
// siendo la única fuente de verdad de las tareas.
//
// `import "server-only"` hace que el build falle si este archivo se importa
// desde un componente cliente, para que la secret key nunca llegue al bundle
// del navegador.

export type MagicflowTask = {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  priority: "none" | "low" | "medium" | "high";
  completed: boolean;
  amount_cop: number | null;
  paid: boolean;
  assignedTo: string | null;
  assigneeLabel: string;
  isMine: boolean;
};

export async function getMagicflowTasks(): Promise<{
  tasks: MagicflowTask[];
  error: string | null;
}> {
  const url = process.env.MAGICFLOW_SUPABASE_URL;
  const key = process.env.MAGICFLOW_SUPABASE_SECRET_KEY;

  if (!url || !key) {
    return { tasks: [], error: "not_configured" };
  }

  const supabase = createClient(url, key);

  const [tasksRes, profilesRes, ownerRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, notes, due_date, priority, completed, amount_cop, paid, assigned_to")
      .order("completed", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(100),
    supabase.from("profiles").select("user_id, display_name, email"),
    // El propietario es quien tiene role="owner" en household_members —
    // así identificamos "mis" tareas sin hardcodear un email.
    supabase.from("household_members").select("user_id").eq("role", "owner").limit(1),
  ]);

  if (tasksRes.error) {
    return { tasks: [], error: tasksRes.error.message };
  }

  const profileByUserId = new Map(
    (profilesRes.data ?? []).map((p) => [p.user_id, p.display_name || p.email]),
  );
  const ownerUserId = ownerRes.data?.[0]?.user_id ?? null;

  const tasks: MagicflowTask[] = (tasksRes.data ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    notes: task.notes,
    due_date: task.due_date,
    priority: task.priority,
    completed: task.completed,
    amount_cop: task.amount_cop,
    paid: task.paid,
    assignedTo: task.assigned_to,
    assigneeLabel: task.assigned_to
      ? (profileByUserId.get(task.assigned_to) ?? "Sin identificar")
      : "Sin asignar",
    isMine: task.assigned_to !== null && task.assigned_to === ownerUserId,
  }));

  return { tasks, error: null };
}
