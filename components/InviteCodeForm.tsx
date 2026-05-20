"use client";

import { useActionState } from "react";
import { verifyInviteCode } from "@/lib/actions";

export function InviteCodeForm({ eventId }: { eventId: string }) {
  const action = verifyInviteCode.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <input
          name="code"
          type="text"
          required
          placeholder="es. AB3K7Z"
          maxLength={6}
          className="flex-1 rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white uppercase tracking-widest placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          {pending ? "..." : "Entra"}
        </button>
      </div>
      {state?.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
