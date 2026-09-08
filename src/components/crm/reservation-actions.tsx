"use client";

import { useState, useTransition } from "react";
import type { GeneratePaymentLinkResult } from "@/app/(crm)/calendario/actions";

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
    </div>
  );
}
