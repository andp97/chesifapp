import Image from "next/image";
import { CreateEventForm } from "@/components/CreateEventForm";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.svg" alt="ChesifApp?" width={72} height={72} className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold">ChesifApp?</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Organizza, conferma, dividi.</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-5">Crea un nuovo evento</h2>
          <CreateEventForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} />
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Dopo la creazione riceverai un codice admin e un codice invito da condividere.
        </p>
      </div>
    </main>
  );
}
