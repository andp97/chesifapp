import Image from "next/image";
import { createEvent } from "@/lib/actions";

const dateInputCls =
  "w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light]";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.svg" alt="Che si fa?" width={72} height={72} className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">Che-sif-App</h1>
          <p className="mt-2 text-gray-500">Organizza, conferma, dividi.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-5">Crea un nuovo evento</h2>

          <form action={createEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome evento
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="es. Ombrellone al mare 🏖️"
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
                placeholder="es. 120.00"
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
                  <input name="startDate" type="date" className={dateInputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fine (se periodo)</label>
                  <input name="endDate" type="date" className={dateInputCls} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Info pagamento{" "}
                <span className="text-gray-400 font-normal">(opzionale)</span>
              </label>
              <textarea
                name="paymentInfo"
                rows={3}
                placeholder={"es. PayPal: mario@email.it\nIBAN: IT60 X054 2811 1010 0000 0123 456"}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              Crea evento →
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Dopo la creazione riceverai un codice admin e un codice invito da condividere.
        </p>
      </div>
    </main>
  );
}
