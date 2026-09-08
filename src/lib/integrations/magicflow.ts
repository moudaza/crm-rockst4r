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
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, notes, due_date, priority, completed, amount_cop, paid")
    .order("completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(50);

  if (error) {
    return { tasks: [], error: error.message };
  }

  return { tasks: data ?? [], error: null };
}
