"use client";

import { useActionState } from "react";
import { verifyAdminCode } from "@/lib/actions";

export function AdminCodeForm({ eventId }: { eventId: string }) {
  const action = verifyAdminCode.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Codice admin
        </label>
        <input
          name="code"
          type="text"
          required
          autoFocus
          placeholder="es. AB3K7ZXQ4R"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
      >
        {pending ? "Verifica..." : "Accedi"}
      </button>
    </form>
  );
}
