"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ⚠️ OBS: Att exportera 'metadata' i en client-komponent visade sig orsakar build-fel i Next.js (App Router).

// Enkel inline-ikon (ersätter lucide-react för att undvika extra dependency i builden)
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  );
}

// Tacksida som visas efter att kontaktformuläret skickats.
// Visar en bekräftelse och räknar automatiskt ner tills användaren skickas till startsidan.
export default function ThanksPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5); // antal sekunder kvar innan redirect

  // Startar nedräkningen och skickar användaren till startsidan när tiden är slut.
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/"); // redirect till startsidan
      return;
    }

    // Räknar ner varje sekund
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);

    // Städar upp timern vid unmount
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <section className="flex flex-col items-center justify-center text-center space-y-6 py-24">
      {/* Ikon som ger visuell bekräftelse */}
      <CheckIcon className="text-green-500 dark:text-green-400 w-16 h-16" />

      {/* Rubrik och kort meddelande */}
      <h1 className="text-3xl font-bold">Tack för ditt meddelande!</h1>
      <p className="text-gray-700 dark:text-gray-300 max-w-md">
        Jag har mottagit ditt mejl och återkommer så snart jag kan 💌
      </p>

      {/* nedräkning */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Du skickas tillbaka till startsidan om <b>{countdown}</b> sekunder...
      </p>

      {/* Alternativa länkar för att navigera direkt */}
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl border bg-black px-5 py-2.5 font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          Till startsidan nu
        </Link>
        <Link
          href="/projects"
          className="rounded-xl border px-5 py-2.5 font-medium transition hover:bg-black/5 dark:hover:bg-white/10"
        >
          Se projekt
        </Link>
      </div>
    </section>
  );
}
