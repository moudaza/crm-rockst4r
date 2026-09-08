"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/update-password` },
    );

    setLoading(false);

    if (resetError) {
      setError("No pudimos enviar el email. Intentá de nuevo.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[#f5f5f7] px-4 dark:bg-black">
      <div className="w-full max-w-sm card p-8">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Restablecer contraseña
        </h1>

        {sent ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Si <span className="font-medium">{email}</span> tiene una cuenta,
            te enviamos un email con un link para elegir una nueva contraseña.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Ingresá tu email y te mandamos un link para restablecerla.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2"
              >
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          </>
        )}

        <Link
          href="/login"
          className="mt-6 block text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Volver al login
        </Link>
      </div>
    </div>
  );
}
