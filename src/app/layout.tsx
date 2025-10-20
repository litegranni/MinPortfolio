"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

/**
 * Initierar tema tidigt, redan innan render, för att undvika flash
 * samt säkerställa att HELA sidan växlar till mörkt läge direkt.
 * Läser sparat val i localStorage, annars får det snällt följa systeminställningen.
 */
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t ? t === 'dark' : prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // --- Dark mode sparas i localStorage och visas på <html>) ---
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sätt initialt tema, tidigare val eller systempreferens
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme((saved as "light" | "dark") || (prefersDark ? "dark" : "light"));
  }, []);

  // Uppdaterat <html>.dark + persistens
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // --- Global projektsök (URL-baserad så den funkar på Projektsidan) ---
  const router = useRouter();
  const [q, setQ] = useState("");
  function goSearch(e: React.FormEvent) {
    e.preventDefault();
    const url = q.trim() ? `/projects?query=${encodeURIComponent(q.trim())}` : "/projects";
    router.push(url); // navigera till resultat
    setQ("");         // nollställ fältet för tydlig feedback
  }

  return (
    <html lang="sv" suppressHydrationWarning>
      <head>
        {/* Sätt dark/light på <html> innan Tailwind ritar annars får jag FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={[
          "min-h-screen",
          // Bastextfärger för båda teman (inget försvinner i dark)
          "text-gray-900 dark:text-gray-100",
          // Helkroppsbakgrund (alltså solid + gradient) i båda lägen
          "bg-[linear-gradient(180deg,#f7f7fb_0%,#f1f7ff_100%)]",
          "dark:bg-[linear-gradient(180deg,#0b0b0f_0%,#0f1720_100%)]",
        ].join(" ")}
      >
        {/* Sticky nav för konsekvens i navigationen och snabb åtkomst till sök + tema */}
        <header className="sticky top-0 z-20">
          <nav className="mx-auto max-w-5xl px-4 pt-4">
            <div className="card-glass rounded-2xl border px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-center gap-3">
                {/* huvudsakliga navigeringen */}
                <div className="flex items-center gap-4">
                  <Link className="font-semibold link-anim" href="/">Hem</Link>
                  <Link className="font-semibold link-anim" href="/projects">Projekt</Link>
                  <Link className="font-semibold link-anim" href="/contact">Kontakta mig</Link>
                </div>

                {/* Global sök + tema-toggle (visuell återkoppling med ikon/clear) */}
                <form onSubmit={goSearch} className="ml-auto flex items-center gap-2">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Sök projekt…"
                    className="rounded-xl border px-3 py-1.5 text-sm bg-white/80 dark:bg-white/10"
                  />
                  <button
                    className="rounded-xl border px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Sök
                  </button>

                  {/* Temaknapp, alltså växlar light/dark och sparar valet */}
                  <button
                    onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                    type="button"
                    className="rounded-xl border px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    title="Växla dark mode"
                  >
                    {theme === "dark" ? "☀️" : "🌙"}
                  </button>
                </form>
              </div>
            </div>
          </nav>
        </header>

        <main className="relative mx-auto max-w-5xl px-4 py-8">
          {/* snyggare bakgrundsgrid (pointer-events none så innehåll går att klicka) */}
          <div className="pointer-events-none absolute inset-0 bg-grid"></div>

          {/* Sidinnehåll */}
          <div className="relative">{children}</div>
        </main>
      </body>
    </html>
  );
}
