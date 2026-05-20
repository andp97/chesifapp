import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  addParticipant,
  removeParticipant,
  updatePaymentStatus,
  updateEvent,
} from "@/lib/actions";
import { ParticipantStatus, PaymentStatus } from "@/app/generated/prisma/enums";
import type { Participant } from "@/app/generated/prisma/client";
import { CopyButton } from "@/components/CopyButton";
import { AdminCodeForm } from "@/components/AdminCodeForm";
import { formatEventDate, toInputDate } from "@/lib/dates";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { participants: { orderBy: { createdAt: "asc" } } },
  });

  if (!event) notFound();

  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get(`admin_${id}`);

  if (!isAdmin) {
    return <AdminCodeGate eventId={id} eventName={event.name} />;
  }

  const confirmed = event.participants.filter(
    (p) => p.status === ParticipantStatus.CONFIRMED
  ).length;
  const paid = event.participants.filter(
    (p) => p.paymentStatus === PaymentStatus.PAID
  ).length;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const shareUrl = `${baseUrl}/evento/${id}`;

  return (
    <main className="min-h-screen p-4 max-w-lg mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
            Pannello Admin
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          {formatEventDate(event.startDate, event.endDate) && (
            <p className="text-sm text-blue-600 font-medium mt-0.5">
              📅 {formatEventDate(event.startDate, event.endDate)}
            </p>
          )}
        </div>
        <a
          href={`/evento/${id}`}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Vista pubblica
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Totale" value={event.participants.length} />
        <StatCard label="Confermati" value={confirmed} color="green" />
        <StatCard label="Pagati" value={paid} color="emerald" />
      </div>

      {/* Codes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Codici evento</h2>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">
            LINK + CODICE INVITO — condividi con i partecipanti
          </p>
          <div className="flex gap-2 mb-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600 min-w-0"
            />
            <CopyButton text={shareUrl} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Codice invito:</span>
            <code className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 text-sm font-mono font-bold tracking-widest text-amber-800">
              {event.inviteCode}
            </code>
            <CopyButton text={event.inviteCode} label="Copia codice" />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">
            CODICE ADMIN — tienilo segreto
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono font-bold tracking-widest text-gray-700 flex-1">
              {event.adminCode}
            </code>
            <CopyButton text={event.adminCode} label="Copia" />
          </div>
        </div>
      </div>

      {/* Add participant */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Aggiungi partecipante</h2>
        <form action={addParticipant.bind(null, id)} className="flex gap-2">
          <input
            name="name"
            type="text"
            required
            placeholder="Nome e cognome"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors whitespace-nowrap"
          >
            + Aggiungi
          </button>
        </form>
      </div>

      {/* Participant list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Partecipanti</h2>
        </div>
        {event.participants.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400">Nessun partecipante ancora.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {event.participants.map((p) => (
              <AdminParticipantRow key={p.id} participant={p} eventId={id} />
            ))}
          </ul>
        )}
      </div>

      {/* Edit event */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Modifica evento</h2>
        <form action={updateEvent.bind(null, id)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome evento
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={event.name}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo totale (€)
            </label>
            <input
              name="totalCost"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={event.totalCost}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data{" "}
              <span className="text-gray-400 font-normal">(opzionale)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Inizio</label>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={event.startDate ? toInputDate(event.startDate) : ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fine (se periodo)</label>
                <input
                  name="endDate"
                  type="date"
                  defaultValue={event.endDate ? toInputDate(event.endDate) : ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Info pagamento
            </label>
            <textarea
              name="paymentInfo"
              rows={3}
              defaultValue={event.paymentInfo}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            Salva modifiche
          </button>
        </form>
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AdminCodeGate({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{eventName}</h1>
          <p className="text-sm text-gray-500 mt-1">Area organizzatore</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <AdminCodeForm eventId={eventId} />
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          <a href={`/evento/${eventId}`} className="hover:underline">
            ← Torna alla vista pubblica
          </a>
        </p>
      </div>
    </main>
  );
}

function AdminParticipantRow({
  participant: p,
  eventId,
}: {
  participant: Participant;
  eventId: string;
}) {
  const nextPaymentStatus =
    p.paymentStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : PaymentStatus.PAID;

  return (
    <li className="px-5 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 truncate">{p.name}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <StatusBadge status={p.status} />
            <PaymentBadge paymentStatus={p.paymentStatus} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <form action={updatePaymentStatus.bind(null, p.id, nextPaymentStatus, eventId)}>
            <button
              type="submit"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                p.paymentStatus === PaymentStatus.PAID
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-100 text-gray-600 hover:bg-emerald-100"
              }`}
            >
              {p.paymentStatus === PaymentStatus.PAID ? "Pagato ✓" : "Segna pagato"}
            </button>
          </form>
          <form action={removeParticipant.bind(null, p.id, eventId)}>
            <button
              type="submit"
              className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

function StatCard({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: number;
  color?: "blue" | "green" | "emerald";
}) {
  const colorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    emerald: "text-emerald-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ParticipantStatus }) {
  const map: Record<ParticipantStatus, { label: string; className: string }> = {
    PENDING: { label: "In attesa", className: "bg-gray-100 text-gray-500" },
    CONFIRMED: { label: "Confermato", className: "bg-green-100 text-green-700" },
    DECLINED: { label: "Non viene", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = map[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function PaymentBadge({ paymentStatus }: { paymentStatus: PaymentStatus }) {
  return paymentStatus === PaymentStatus.PAID ? (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
      Pagato ✓
    </span>
  ) : (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">
      Da pagare
    </span>
  );
}
