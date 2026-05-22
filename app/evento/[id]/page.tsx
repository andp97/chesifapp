import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { updateParticipantStatus } from "@/lib/actions";
import { ParticipantStatus, PaymentStatus } from "@/app/generated/prisma/enums";
import type { Participant } from "@/app/generated/prisma/client";
import { InviteCodeForm } from "@/components/InviteCodeForm";
import { FormButton } from "@/components/FormButton";
import { formatEventDate } from "@/lib/dates";

export default async function EventPage({
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
  const hasAccess =
    !!cookieStore.get(`invite_${id}`) || !!cookieStore.get(`admin_${id}`);

  const confirmed = event.participants.filter(
    (p) => p.status === ParticipantStatus.CONFIRMED
  ).length;
  const pending = event.participants.filter(
    (p) => p.status === ParticipantStatus.PENDING
  ).length;
  const total = event.participants.length;

  const confirmedShares = event.participants
    .filter((p) => p.status === ParticipantStatus.CONFIRMED)
    .reduce((sum, p) => sum + p.quotes, 0);
  const totalShares = event.participants.reduce((sum, p) => sum + p.quotes, 0);

  const costPerShare =
    confirmedShares > 0
      ? event.totalCost / confirmedShares
      : totalShares > 0
        ? event.totalCost / totalShares
        : event.totalCost;

  const costLabel =
    confirmedShares > 0
      ? `${confirmed} confermati → €${costPerShare.toFixed(2)} a quota`
      : totalShares > 0
        ? `Nessuno ancora — €${costPerShare.toFixed(2)} a quota (su tutti)`
        : `€${event.totalCost.toFixed(2)} totale`;

  return (
    <main className="min-h-screen p-4 max-w-lg mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {formatEventDate(event.startDate, event.endDate) && (
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              📅 {formatEventDate(event.startDate, event.endDate)}
            </span>
          )}
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {total} partecipant{total === 1 ? "e" : "i"}
          </p>
        </div>
      </div>

      {/* Cost card */}
      <div className="bg-blue-600 text-white rounded-2xl p-5 mb-6 shadow-sm">
        <p className="text-sm opacity-80 mb-1">Quota stimata</p>
        <p className="text-xl font-semibold">{costLabel}</p>
        <p className="text-sm opacity-70 mt-1">
          Totale evento: €{event.totalCost.toFixed(2)}
        </p>
      </div>

      {/* Invite code gate */}
      {!hasAccess && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Partecipa all&apos;evento</h2>
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
            Inserisci il codice invito per confermare o rifiutare la tua partecipazione.
          </p>
          <InviteCodeForm eventId={id} />
        </div>
      )}

      {/* Participant list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold">Partecipanti</h2>
          {pending > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {pending} in attesa
            </span>
          )}
        </div>
        {event.participants.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">
            Nessun partecipante ancora.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {event.participants.map((p) => (
              <ParticipantRow
                key={p.id}
                participant={p}
                eventId={id}
                hasAccess={hasAccess}
                costPerShare={costPerShare}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Payment info */}
      {event.paymentInfo && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
          <h2 className="font-semibold mb-2">Come pagare</h2>
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
            {event.paymentInfo}
          </pre>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        <a href={`/evento/${id}/admin`} className="hover:underline">
          Sei l&apos;organizzatore? Accedi al pannello admin
        </a>
      </p>
    </main>
  );
}

function ParticipantRow({
  participant: p,
  eventId,
  hasAccess,
  costPerShare,
}: {
  participant: Participant;
  eventId: string;
  hasAccess: boolean;
  costPerShare: number;
}) {
  return (
    <li className="px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{p.name}</p>
            {p.quotes > 1 && (
              <span className="shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-full px-2 py-0.5">
                ×{p.quotes} — €{(costPerShare * p.quotes).toFixed(2)}
              </span>
            )}
          </div>
          {!hasAccess && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={p.status} />
              <PaymentBadge paymentStatus={p.paymentStatus} />
            </div>
          )}
        </div>

        {hasAccess && (
          <div className="flex gap-2 shrink-0">
            <form
              action={updateParticipantStatus.bind(null, p.id, ParticipantStatus.CONFIRMED, eventId)}
            >
              <FormButton
                type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  p.status === ParticipantStatus.CONFIRMED
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                }`}
              >
                Confermo ✓
              </FormButton>
            </form>
            <form
              action={updateParticipantStatus.bind(null, p.id, ParticipantStatus.DECLINED, eventId)}
            >
              <FormButton
                type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  p.status === ParticipantStatus.DECLINED
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                }`}
              >
                Non vengo ✗
              </FormButton>
            </form>
          </div>
        )}
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
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function PaymentBadge({ paymentStatus }: { paymentStatus: PaymentStatus }) {
  if (paymentStatus === PaymentStatus.PAID) {
    return (
      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
        Pagato ✓
      </span>
    );
  }
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
      Da pagare
    </span>
  );
}
