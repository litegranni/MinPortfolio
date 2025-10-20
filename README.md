# Min Portfolio

## Liveversion
[https://min-portfolio-eight.vercel.app/](https://min-portfolio-eight.vercel.app/)

---

## Projektbeskrivning
**Min Portfolio** är en personlig webbsida byggd med **Next.js** och **Tailwind CSS**, skapad för att presentera mina utvecklingsprojekt på ett modernt, strukturerat och responsivt sätt.  
Webbplatsen fungerar som en digital samlingsplats för mina tidigare och pågående arbeten, samt som en subtil demonstration av min tekniska kompetens inom fullstack-webbutveckling.

Besökaren kan:
- Se mina olika projekt med beskrivningar, loggor och taggar.  
- Söka och filtrera bland projekten.  
- Visa koden direkt på sidan via inbäddade README-filer hämtade från GitHub.  
- Kontakta mig via ett formulär som skickas direkt till min e-postadress.  
- Växla mellan ljust och mörkt läge beroende på systeminställning eller preferens.

---

## Syfte och mål
Projektets syfte var att utveckla en **skalbar, responsiv och professionell portfoliowebbplats** som visar förståelse för komponentbaserad utveckling, reaktiv dataladdning och deploymentprocesser.  
Målet var att skapa en applikation som är **underhållbar, tillgänglig och lätt att bygga ut**, samtidigt som den fungerar som en personlig profil mot framtida arbetsgivare och samarbetspartners.

Arbetet ingår som en del av kursen i *Webbutveckling* och bedöms efter förmåga att:
- Strukturera en modern Next.js-applikation  
- Använda React Hooks och komponentbaserad design  
- Hantera dataflöden och API-anrop  
- Styla responsivt med Tailwind CSS  
- Publicera och underhålla projektet i produktion (Vercel)

---

## Arkitektur och designval

### Next.js (v15)
Next.js valdes som ramverk för att kombinera Reacts komponentbaserade styrka med möjligheten till enkel server-rendering och statisk export.  
Projektet använder *app-directory-strukturen* för tydlig separation mellan sidor, logik och komponenter.  

Alla sidor (`/projects`, `/contact`, `/contact/thanks`) är **server-renderade vid build-tid**, medan interaktiv logik hanteras via *client components* med `use client`.

### Tailwind CSS (v4)
Tailwind CSS används för snabb prototypning och responsiv design.  
Version 4 medförde vissa förändringar i hur `tailwind.config.ts` och `postcss` hanteras, vilket krävde manuell initiering i Windowsmiljö.  
Stylingen använder utility-klasser för att undvika duplicerad CSS och möjliggöra konsekvent tema-växling mellan mörkt och ljust läge.

### Datakälla
För enklare hantering av projektdatan används **lokal data i TypeScript-array** istället för en separat API-route.  
Tidigare versioner använde `/api/projects`, men eftersom detta inte var ett krav för uppgiften valdes en renare frontend-lösning för stabil deployment till Vercel.

README-filerna hämtas däremot **live** från GitHub via:
- `https://cdn.jsdelivr.net/gh/...`
- `https://raw.githubusercontent.com/...`

För att rendera dessa används **Marked.js**, vilket konverterar Markdown till HTML direkt i klienten.

### State och logik
All interaktivitet styrs via React Hooks:
- `useState` för lokal state-hantering  
- `useEffect` för asynkrona anrop  
- `useMemo` för att optimera filtrering och sortering  
- `useSearchParams` för att läsa sökparametrar i URL  
Denna hook kapslas in i en `<Suspense>`-boundary enligt Next.js 15:s krav för client-side rendering.

### Deployment
Projektet deployas via **Vercel**, vilket automatiskt bygger om sidan vid varje `git push` till `main`.  
Denna CI/CD-process demonstrerar förståelse för automatiserad deployment i modern webbutveckling.

---

## Funktioner

### 1. Projektsida
- Dynamisk rendering av projekt från lokal data.  
- Varje kort visar:
  - Logotyp  
  - Titel och beskrivning  
  - Taggar  
  - Länk till GitHub  
  - Inline-visning av README.md via Marked.js  
- Stöd för:
  - Sökning i titlar och beskrivningar  
  - Sortering (titel eller datum)  
  - Tagg-filtrering  
  - Responsivt grid-layout  

### 2. Kontaktformulär
- Byggt med **Formspree** som hanterar e-postutskick utan egen backend.  
- Vid lyckad inskickning visas `/contact/thanks` med bekräftelse.  
- En nedräkning räknar ned fem sekunder innan användaren automatiskt omdirigeras till startsidan.  

### 3. Dark Mode
- Automatisk detektering av användarens systeminställning.  
- Möjlighet att växla manuellt via knapp i navbar.  
- Valet sparas i `localStorage` för framtida sessioner.  
- Hela layouten (bakgrund, text, kort, knappar) anpassas dynamiskt.

---

## Lärdomar och reflektion

### Tekniska lärdomar
Under projektet lärde jag mig att:
- Initiera och konfigurera **Tailwind CSS v4** manuellt i Windows-miljö.  
- Lösa `npm`-fel relaterade till script-policy genom att ändra PowerShells `ExecutionPolicy`.  
- Förstå **skillnaden mellan lokal utveckling och produktion** på Vercel, särskilt i hantering av miljöer utan filsystemtillgång.  
- Hantera **typfel i TypeScript** och använda statisk typning för säkrare komponenter.  
- Optimera `useEffect`-beroenden och använda `Suspense` korrekt med `useSearchParams`.  
- Använda externa GitHub-resurser och konvertera Markdown till HTML på klientsidan.

### Problemhantering
Några utmaningar som löstes under arbetet:
1. **Lucide Icons** fungerade inte i Vercel-miljön – de togs bort för att säkerställa stabil build.  
2. **API-routes** togs bort eftersom de inte krävdes och orsakade build-fel. Lokal data användes istället.  
3. **useSearchParams** gav fel vid deployment och löstes genom att lägga logiken i en `<Suspense>`-boundary.  
4. ESLint-fel i `projects/page.tsx` åtgärdades genom förbättrad typning och flytt av variabler in i hookar.  

### Personlig reflektion
Projektet har gett en tydlig förståelse för **hur frontend och deployment hänger ihop**.  
Att se hela kedjan, från kodning lokalt till färdig publicering, gav en stark känsla av kontroll och helhetsförståelse.  
Jag upplever att jag nu har en stabil grund i Next.js och kan arbeta mer självständigt i moderna ramverk.

---

## Framtida utveckling

- Koppla projekten till en databas (t.ex. MySQL eller DynamoDB)  
- Lägga till autentisering för att kunna uppdatera projekt via ett admin-gränssnitt  
- Implementera server-side API-routes igen för dynamisk dataladdning  
- Införa tagg-baserad routing (`/projects/tag/hälsa`)  
- Göra sidan flerspråkig (svenska/engelska)  
- Lägga till fler kontaktalternativ (LinkedIn, GitHub-knapp, etc.)  

---

## Sammanfattning

**Future Portfolio** visar en komplett förståelse för hur en modern webbapplikation byggs, struktureras och publiceras.  
Den demonstrerar både **teknisk kompetens (Next.js, React Hooks, Tailwind)** och **förmåga till problemlösning och reflektion**.  

Projektet kombinerar funktionell design, tydlig kodstruktur och en användarupplevelse som fungerar både lokalt och i produktion.  
Det representerar ett professionellt steg i utvecklingen mot fullfjädrad frontend- och fullstack-utveckling.

## Deployment

Projektet deployas automatiskt via **Vercel**, kopplat till GitHub-repot.  
Vid varje ny commit på `main` sker:

1. Build-process i Vercel  
2. Type-kontroll och linting  
3. Automatisk publicering till live-domänen  

## Kör lokalt

```bash
git clone https://github.com/litegranni/future-portfolio.git
cd future-portfolio
npm install
npm run dev
## Kör lokalt

Öppna sedan i webbläsaren:  
[http://localhost:3000](http://localhost:3000)



Projektstruktur

src/
├─ app/
│ ├─ contact/
│ │ ├─ page.tsx
│ │ └─ thanks/page.tsx
│ ├─ projects/
│ │ └─ page.tsx
│ ├─ layout.tsx
│ └─ page.tsx
├─ lib/
└─ public/
├─ RankRoom.png
├─ PlantPal.png
├─ FitLog.png
├─ NoteCloud.png
└─ me.jpg


