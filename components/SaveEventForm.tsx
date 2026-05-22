"use client";

import { useActionState, useEffect, useState } from "react";
import { updateEvent } from "@/lib/actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

const dateInputCls =
  "w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark]";

type Props = {
  eventId: string;
  defaultName: string;
  defaultTotalCost: number;
  defaultPaymentInfo: string;
  defaultStartDate: string;
  defaultEndDate: string;
};

export function SaveEventForm({
  eventId,
  defaultName,
  defaultTotalCost,
  defaultPaymentInfo,
  defaultStartDate,
  defaultEndDate,
}: Props) {
  const [state, formAction, pending] = useActionState(
    updateEvent.bind(null, eventId),
    {}
  );

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <h2 className="font-semibold mb-4">Modifica evento</h2>
      <form action={formAction} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome evento
          </label>
          <input name="name" type="text" required defaultValue={defaultName} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Costo totale (€)
          </label>
          <input
            name="totalCost"
            type="text"
            inputMode="decimal"
            required
            pattern="[0-9]*[.,]?[0-9]{0,2}"
            defaultValue={defaultTotalCost}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data{" "}
            <span className="text-gray-400 dark:text-gray-500 font-normal">(opzionale)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Inizio</label>
              <input name="startDate" type="date" defaultValue={defaultStartDate} className={dateInputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fine (se periodo)</label>
              <input name="endDate" type="date" defaultValue={defaultEndDate} className={dateInputCls} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Info pagamento
          </label>
          <textarea
            name="paymentInfo"
            rows={3}
            defaultValue={defaultPaymentInfo}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            {pending ? "Salvataggio…" : "Salva modifiche"}
          </button>
          {showSuccess && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
              Salvato ✓
            </span>
          )}
        </div>
        {state.error && (
          <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </form>
    </div>
  );
}
