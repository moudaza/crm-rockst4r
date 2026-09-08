"use client";

import { useState, useTransition } from "react";
import type { GeneratePaymentLinkResult } from "@/app/(crm)/calendario/actions";
import { MANUAL_PAYMENT_ACCOUNTS } from "@/lib/manual-payment-info";

export function ReservationActions({
  id,
  status,
  confirmAction,
  cancelAction,
  generatePaymentLinkAction,
}: {
  id: string;
  status: "PRE_RESERVED" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
  confirmAction: (id: string) => Promise<void>;
  cancelAction: (id: string) => Promise<void>;
  generatePaymentLinkAction: (id: string) => Promise<GeneratePaymentLinkResult>;
}) {
  const [isPending, startTransition] = useTransition();
  const [isPaymentPending, startPaymentTransition] = useTransition();
  const [paymentResult, setPaymentResult] = useState<GeneratePaymentLinkResult | null>(null);
  const [showManualPayment, setShowManualPayment] = useState(false);

  if (status !== "PRE_RESERVED" && status !== "CONFIRMED") {
    return <span className="text-sm text-zinc-400 dark:text-zinc-600">—</span>;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex justify-end gap-3">
        {status === "PRE_RESERVED" && (
          <>
            <button
              type="button"
              disabled={isPaymentPending}
              onClick={() =>
                startPaymentTransition(async () => {
                  setPaymentResult(await generatePaymentLinkAction(id));
                })
              }
              className="text-sm font-medium text-sky-600 hover:text-sky-700 disabled:opacity-50 dark:text-sky-400"
            >
              {isPaymentPending ? "Generando..." : "Generar link de pago"}
            </button>
            <button
              type="button"
              onClick={() => setShowManualPayment((v) => !v)}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Transferencia manual
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => confirmAction(id))}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50 dark:text-emerald-400"
            >
              Confirmar
            </button>
          </>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => cancelAction(id))}
          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
        >
          Cancelar
        </button>
      </div>
      {paymentResult && "error" in paymentResult && (
        <p className="text-sm text-red-600 dark:text-red-400">{paymentResult.error}</p>
      )}
      {paymentResult && "checkoutUrl" in paymentResult && (
        <a
          href={paymentResult.checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="max-w-xs truncate text-sm text-sky-600 underline hover:text-sky-700 dark:text-sky-400"
        >
          {paymentResult.checkoutUrl}
        </a>
      )}
      {showManualPayment && (
        <div className="flex w-full max-w-xs flex-col gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-right text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {MANUAL_PAYMENT_ACCOUNTS.map((account) => (
            <p key={account.method}>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{account.method}:</span>{" "}
              <span className="text-zinc-600 dark:text-zinc-400">{account.detail}</span>
            </p>
          ))}
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            Copiá y enviá al cliente. Una vez verificada la transferencia, tocá &quot;Confirmar&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
