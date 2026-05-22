"use client";

import { useState, useRef, useEffect } from "react";
import { useActionState } from "react";
import {
  addParticipant,
  removeParticipant,
  updatePaymentStatus,
  updateParticipantQuotes,
} from "@/lib/actions";
import { ParticipantStatus, PaymentStatus } from "@/app/generated/prisma/enums";
import type { Participant } from "@/app/generated/prisma/client";

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

export function AdminParticipantSection({
  participants,
  eventId,
}: {
  participants: Participant[];
  eventId: string;
}) {
  const [filter, setFilter] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    addParticipant.bind(null, eventId),
    {}
  );

  const prevPending = useRef(false);
  useEffect(() => {
    if (prevPending.current && !pending && !state?.error) {
      setFilter("");
      formRef.current?.reset();
    }
    prevPending.current = pending;
  }, [pending, state]);

  const trimmed = filter.trim();
  const filtered =
    trimmed.length >= 2
      ? participants.filter((p) =>
          p.name.toLowerCase().includes(trimmed.toLowerCase())
        )
      : null;

  const displayedParticipants = filtered ?? participants;

  return (
    <>
      {/* Add participant */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-1">Aggiungi partecipante</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Scrivi il nome per cercarlo nella lista prima di aggiungerlo.
        </p>
        <form ref={formRef} action={formAction} className="flex gap-2">
          <input
            name="name"
            type="text"
            required
            placeholder="Nome e cognome"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`${inputCls} flex-1`}
          />
          <input
            name="quotes"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={1}
            title="Numero di quote"
            className="w-16 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-2 text-sm text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors whitespace-nowrap"
          >
            {pending ? "..." : "+ Aggiungi"}
          </button>
        </form>
        {state?.error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </div>

      {/* Participant list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold">Partecipanti</h2>
          {trimmed.length >= 2 && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {filtered?.length === 0
                ? "Nessuna corrispondenza"
                : `${filtered?.length} trovat${filtered?.length === 1 ? "o" : "i"}`}
            </span>
          )}
        </div>
        {participants.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">
            Nessun partecipante ancora.
          </p>
        ) : displayedParticipants.length === 0 ? (
          <p className="px-5 py-4 text-sm text-amber-600 dark:text-amber-400">
            Nessun partecipante con questo nome.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {displayedParticipants.map((p) => (
              <AdminParticipantRow
                key={p.id}
                participant={p}
                eventId={eventId}
                highlight={trimmed.length >= 2}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function AdminParticipantRow({
  participant: p,
  eventId,
  highlight,
}: {
  participant: Participant;
  eventId: string;
  highlight?: boolean;
}) {
  const nextPaymentStatus =
    p.paymentStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : PaymentStatus.PAID;

  return (
    <li className={`px-5 py-3 ${highlight ? "bg-amber-50 dark:bg-amber-900/10" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        {/* Left: name + stepper stacked above badges */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{p.name}</p>
            {/* Quotes stepper */}
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg px-1 py-1 shrink-0">
              <form action={updateParticipantQuotes.bind(null, p.id, p.quotes - 1, eventId)}>
                <button
                  type="submit"
                  disabled={p.quotes <= 1}
                  className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                >
                  −
                </button>
              </form>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[1.25rem] text-center px-0.5">
                {p.quotes}
              </span>
              <form action={updateParticipantQuotes.bind(null, p.id, p.quotes + 1, eventId)}>
                <button
                  type="submit"
                  className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  +
                </button>
              </form>
            </div>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap items-center">
            <StatusBadge status={p.status} />
            <PaymentBadge paymentStatus={p.paymentStatus} />
          </div>
        </div>
        {/* Right: payment toggle + remove */}
        <div className="flex items-center gap-2 shrink-0">
          <form action={updatePaymentStatus.bind(null, p.id, nextPaymentStatus, eventId)}>
            <button
              type="submit"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                p.paymentStatus === PaymentStatus.PAID
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
              }`}
            >
              {p.paymentStatus === PaymentStatus.PAID ? "Pagato ✓" : "Segna pagato"}
            </button>
          </form>
          <form action={removeParticipant.bind(null, p.id, eventId)}>
            <button
              type="submit"
              className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: ParticipantStatus }) {
  const map: Record<ParticipantStatus, { label: string; className: string }> = {
    PENDING: { label: "In attesa", className: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" },
    CONFIRMED: { label: "Confermato", className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
    DECLINED: { label: "Non viene", className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  };
  const { label, className } = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}

function PaymentBadge({ paymentStatus }: { paymentStatus: PaymentStatus }) {
  return paymentStatus === PaymentStatus.PAID ? (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
      Pagato ✓
    </span>
  ) : (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
      Da pagare
    </span>
  );
}
