import Image from "next/image";
import Link from "next/link";

// Startsida med hero, en CTA och en enkel "Om mig"-sektion.
export default function HomePage() {
  return (
    <section className="space-y-12">
      {/* HERO – pitch + call-to-actions */}
      <header className="card-glass rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col-reverse items-start gap-6 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            {/* Snabb tagrad för tech-stack */}
            <span className="inline-block rounded-full border px-3 py-1 text-sm bg-white/60 dark:bg-white/10">
              React/Next.js • TypeScript • Java/Spring
            </span>

            {/* Huvudrubriken */}
            <h1 className="h1-fancy">
              Hej, jag är Anni! Jag bygger tydliga, snabba och praktiska webbappar i Java och AWS.
            </h1>

            {/* Kort intro, om sidan och vars koden finns */}
            <p className="max-w-prose text-lg text-gray-700 dark:text-gray-200">
              Jag är 29 år, en norrlänning bosatt på Gotland.
              Den här portfolion samlar några projekt och visar hur jag jobbar med UI, interaktivitet och struktur.
              I projektsidan finns några av mina arbeten i urval, och det går toppenbra att klicka in på koden därifrån.
            </p>

            {/* CTA-länkar */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="rounded-xl border bg-black px-5 py-2.5 font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
              >
                Se projekt
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border px-5 py-2.5 font-medium transition hover:bg-black/5 dark:hover:bg-white/10"
              >
                Kontakta mig
              </Link>
            </div>
          </div>

          {/* Porträtt från Fårö */}
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border bg-white/70 dark:bg-white/10 md:h-48 md:w-48">
            <Image
              src="/me.jpg" /* lagt bild i /public/me.jpg */
              alt="Porträtt"
              fill
              className="object-cover"
              sizes="192px"
              priority
            />
          </div>
        </div>
      </header>

      {/* OM MIG. rutor med bakgrund, kompetens och vars jag håller till atm */}
      <section aria-labelledby="about-title" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card-glass rounded-2xl p-5 shadow-sm">
          <h2 id="about-title" className="h2-subtle">Om mig</h2>
          <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
            En 29 åring från <b>Umeå</b>, numera bosatt i <b>Visby</b>. Förutom naturen och min hund, så gillar jag tydliga gränssnitt, bra struktur
            och att lösa problem med enkla medel.
          </p>
        </div>

        <div className="card-glass rounded-2xl p-5 shadow-sm">
          <h3 className="h2-subtle">Kunskap</h3>
          <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
            Tidigt i livet blev jag en språknörd. Jag är idag flytande i svenska, engelska, franska, och bulgariska.
            Inte långt efter kom intresset för <b>kodspråk</b>! Jag kodar bäst i Java, SQL och Golang, men klarar TypeScript utan större svårigheter.
          </p>
        </div>

        <div className="card-glass rounded-2xl p-5 shadow-sm">
          <h3 className="h2-subtle">Just nu</h3>
          <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
            Från november gör jag praktik hos <b>Destination Gotlands utvecklingsgrupp</b>. En uppgift som ökar förståelsen för lätt användning och robusta lösningar.
          </p>
        </div>
      </section>
    </section>
  );
}
