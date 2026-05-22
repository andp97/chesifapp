"use client";

import { useActionState, useEffect, useRef } from "react";
import { createEvent } from "@/lib/actions";

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

const dateInputCls =
  "w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark]";

export function CreateEventForm({ siteKey }: { siteKey: string }) {
  const [state, formAction, pending] = useActionState(createEvent, {});
  const widgetRef = useRef<HTMLDivElement>(null);

  // Reset the Turnstile widget after a failed submission so a new token is generated
  useEffect(() => {
    if (state.error && widgetRef.current) {
      const w = window as unknown as { turnstile?: { reset: (el: HTMLElement) => void } };
      w.turnstile?.reset(widgetRef.current);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nome evento
        </label>
        <input
          name="name"
          type="text"
          required
          placeholder="es. Ombrellone al mare 🏖️"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Costo totale
        </label>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
          <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm border-r border-gray-300 dark:border-gray-600 select-none">
            €
          </span>
          <input
            name="totalCost"
            type="text"
            inputMode="decimal"
            required
            pattern="[0-9]*[.,]?[0-9]{0,2}"
            placeholder="120.00"
            className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Data{" "}
          <span className="text-gray-400 dark:text-gray-500 font-normal">(opzionale)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Inizio</label>
            <input name="startDate" type="date" className={dateInputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fine (se periodo)</label>
            <input name="endDate" type="date" className={dateInputCls} />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Info pagamento{" "}
          <span className="text-gray-400 dark:text-gray-500 font-normal">(opzionale)</span>
        </label>
        <textarea
          name="paymentInfo"
          rows={3}
          placeholder={"es. PayPal: mario@email.it\nIBAN: IT60 X054 2811 1010 0000 0123 456"}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Turnstile widget — populates cf-turnstile-response hidden field automatically */}
      <div ref={widgetRef} className="cf-turnstile" data-sitekey={siteKey} />

      {state.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
      >
        {pending ? "Creazione in corso…" : "Crea evento →"}
      </button>
    </form>
  );
}
