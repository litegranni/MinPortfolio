// Kontakt-sida med ett enkelt formulär som skickar data via Formspree.
// Användaren kan fylla i namn, e-post och meddelande, och får feedback via redirect.
export default function ContactPage() {
  return (
    <section className="space-y-8">
      {/* Sidrubrik */}
      <h1 className="text-3xl font-bold">Kontakta mig</h1>

      {/* Kort introduktionstext */}
      <p className="text-gray-700 dark:text-gray-300 max-w-prose">
        Fyll i formuläret nedan om du vill komma i kontakt med mig – för samarbeten, frågor
        eller bara för att säga hej! ✨
      </p>

      {/* Formuläret skickar till Formspree och redirectar efteråt */}
      <form
        action="https://formspree.io/f/myznvrya"
        method="POST"
        className="card-glass rounded-2xl p-6 shadow-sm space-y-4 max-w-lg"
      >
        {/* Länk till tack-sida efter att formuläret skickats */}
        <input type="hidden" name="_redirect" value="http://localhost:3000/contact/thanks" />

        {/* Namn-fält */}
        <label className="block">
          <span className="text-sm font-medium">Namn</span>
          <input
            type="text"
            name="name"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-white/10"
          />
        </label>

        {/* E-post-fält */}
        <label className="block">
          <span className="text-sm font-medium">E-post</span>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-white/10"
          />
        </label>

        {/* Meddelande-fält */}
        <label className="block">
          <span className="text-sm font-medium">Meddelande</span>
          <textarea
            name="message"
            rows={5}
            required
            className="mt-1 w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-white/10"
          ></textarea>
        </label>

        {/* Knapp som skickar formuläret */}
        <button
          type="submit"
          className="rounded-xl border bg-black px-5 py-2.5 font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
        >
          Skicka meddelande
        </button>
      </form>
    </section>
  );
}
