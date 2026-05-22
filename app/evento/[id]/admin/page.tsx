import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { updateEvent } from "@/lib/actions";
import { ParticipantStatus, PaymentStatus } from "@/app/generated/prisma/enums";
import { CopyButton } from "@/components/CopyButton";
import { AdminCodeForm } from "@/components/AdminCodeForm";
import { AdminParticipantSection } from "@/components/AdminParticipantSection";
import { ShareRecapButton } from "@/components/ShareRecapButton";
import { formatEventDate, toInputDate } from "@/lib/dates";

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

const dateInputCls =
  "w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark]";

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
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-1">
            Pannello Admin
          </p>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          {formatEventDate(event.startDate, event.endDate) && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-0.5">
              📅 {formatEventDate(event.startDate, event.endDate)}
            </p>
          )}
        </div>
        <a
          href={`/evento/${id}`}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Codici evento</h2>
          <ShareRecapButton
            eventName={event.name}
            totalCost={event.totalCost}
            formattedDate={formatEventDate(event.startDate, event.endDate)}
            paymentInfo={event.paymentInfo}
            participants={event.participants.map((p) => ({
              name: p.name,
              status: p.status,
              paymentStatus: p.paymentStatus,
              quotes: p.quotes,
            }))}
            shareUrl={shareUrl}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            LINK + CODICE INVITO — condividi con i partecipanti
          </p>
          <div className="flex gap-2 mb-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 min-w-0"
            />
            <CopyButton text={shareUrl} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Codice invito:</span>
            <code className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-1 text-sm font-mono font-bold tracking-widest text-amber-800 dark:text-amber-300">
              {event.inviteCode}
            </code>
            <CopyButton text={event.inviteCode} label="Copia codice" />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            CODICE ADMIN — tienilo segreto
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm font-mono font-bold tracking-widest text-gray-700 dark:text-gray-300 flex-1">
              {event.adminCode}
            </code>
            <CopyButton text={event.adminCode} label="Copia" />
          </div>
        </div>
      </div>

      <AdminParticipantSection participants={event.participants} eventId={id} />

      {/* Edit event */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h2 className="font-semibold mb-4">Modifica evento</h2>
        <form action={updateEvent.bind(null, id)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome evento
            </label>
            <input name="name" type="text" required defaultValue={event.name} className={inputCls} />
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
              defaultValue={event.totalCost}
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
                <input
                  name="startDate"
                  type="date"
                  defaultValue={event.startDate ? toInputDate(event.startDate) : ""}
                  className={dateInputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fine (se periodo)</label>
                <input
                  name="endDate"
                  type="date"
                  defaultValue={event.endDate ? toInputDate(event.endDate) : ""}
                  className={dateInputCls}
                />
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
              defaultValue={event.paymentInfo}
              className={`${inputCls} resize-none`}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            Salva modifiche
          </button>
        </form>
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AdminCodeGate({ eventId, eventName }: { eventId: string; eventName: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{eventName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Area organizzatore</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <AdminCodeForm eventId={eventId} />
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          <a href={`/evento/${eventId}`} className="hover:underline">
            ← Torna alla vista pubblica
          </a>
        </p>
      </div>
    </main>
  );
}

function StatCard({ label, value, color = "blue" }: { label: string; value: number; color?: "blue" | "green" | "emerald" }) {
  const colorMap = { blue: "text-blue-600 dark:text-blue-400", green: "text-green-600 dark:text-green-400", emerald: "text-emerald-600 dark:text-emerald-400" };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

