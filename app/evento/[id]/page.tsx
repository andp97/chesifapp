import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { updateParticipantStatus } from "@/lib/actions";
import { ParticipantStatus, PaymentStatus } from "@/app/generated/prisma/enums";
import type { Participant } from "@/app/generated/prisma/client";
import { InviteCodeForm } from "@/components/InviteCodeForm";

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
  const total = event.participants.length;
  const costPerPerson =
    confirmed > 0
      ? event.totalCost / confirmed
      : total > 0
        ? event.totalCost / total
        : event.totalCost;

  const costLabel =
    confirmed > 0
      ? `${confirmed} confermati → €${costPerPerson.toFixed(2)} a testa`
      : total > 0
        ? `Nessuno ancora — €${costPerPerson.toFixed(2)} a testa (su tutti)`
        : `€${event.totalCost.toFixed(2)} totale`;

  return (
    <main className="min-h-screen p-4 max-w-lg mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {total} partecipant{total === 1 ? "e" : "i"}
        </p>
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-amber-900 mb-1">Partecipa all&apos;evento</h2>
          <p className="text-sm text-amber-700 mb-3">
            Inserisci il codice invito per confermare o rifiutare la tua partecipazione.
          </p>
          <InviteCodeForm eventId={id} />
        </div>
      )}

      {/* Participant list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Partecipanti</h2>
        </div>
        {event.participants.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400">
            Nessun partecipante ancora.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {event.participants.map((p) => (
              <ParticipantRow
                key={p.id}
                participant={p}
                eventId={id}
                hasAccess={hasAccess}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Payment info */}
      {event.paymentInfo && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Come pagare</h2>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {event.paymentInfo}
          </pre>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
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
}: {
  participant: Participant;
  eventId: string;
  hasAccess: boolean;
}) {
  return (
    <li className="px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 truncate">{p.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={p.status} />
            <PaymentBadge paymentStatus={p.paymentStatus} />
          </div>
        </div>

        {hasAccess && (
          <div className="flex gap-2 shrink-0">
            <form
              action={updateParticipantStatus.bind(
                null,
                p.id,
                ParticipantStatus.CONFIRMED,
                eventId
              )}
            >
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  p.status === ParticipantStatus.CONFIRMED
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-green-100"
                }`}
              >
                Confermo ✓
              </button>
            </form>
            <form
              action={updateParticipantStatus.bind(
                null,
                p.id,
                ParticipantStatus.DECLINED,
                eventId
              )}
            >
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  p.status === ParticipantStatus.DECLINED
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-red-100"
                }`}
              >
                Non vengo ✗
              </button>
            </form>
          </div>
        )}
      </div>
    </li>
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
  if (paymentStatus === PaymentStatus.PAID) {
    return (
      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
        Pagato ✓
      </span>
    );
  }
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">
      Da pagare
    </span>
  );
}
