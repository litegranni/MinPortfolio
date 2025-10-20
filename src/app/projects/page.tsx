"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { marked } from "marked";

type Project = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  updated: string;
  logo: string;
  githubUrl: string;
  owner: string;
  repo: string;
  branch?: string;
};

// Statisk lista över projekt som visas på sidan.
const DATA: Project[] = [
  {
    id: 1,
    title: "RankRoom",
    description: "En app för filmälskaren som vill betygsätta sina sedda filmer.",
    tags: ["film", "betygsättning"],
    updated: "2025-10-01",
    logo: "/RankRoom.png",
    githubUrl: "https://github.com/litegranni/RankRoom",
    owner: "litegranni",
    repo: "RankRoom",
    branch: "master",
  },
  {
    id: 2,
    title: "PlantPal",
    description: "En app för växtälskaren som behöver lite hjälp på traven.",
    tags: ["växter", "app"],
    updated: "2025-09-20",
    logo: "/PlantPal.png",
    githubUrl: "https://github.com/litegranni/PlantPal",
    owner: "litegranni",
    repo: "PlantPal",
  },
  {
    id: 3,
    title: "FitLog",
    description: "En enkel träningslogg för att följa styrkepass och framsteg",
    tags: ["hälsa", "app"],
    updated: "2025-09-10",
    logo: "/FitLog.png",
    githubUrl: "https://github.com/litegranni/FitLog",
    owner: "litegranni",
    repo: "FitLog",
  },
  {
    id: 4,
    title: "NoteCloud",
    description: "Moln-baserad anteckningsapp, när du vill dela anteckningar med någon.",
    tags: ["webb", "ui"],
    updated: "2025-08-28",
    logo: "/NoteCloud.png",
    githubUrl: "https://github.com/litegranni/NoteCloud",
    owner: "litegranni",
    repo: "NoteCloud",
  },
];

// Unik lista av taggar för filterkomponenten.
const ALL_TAGS = Array.from(new Set(DATA.flatMap((p) => p.tags)));

// Komponent som hämtar och visar README för ett repo inline när användaren vill.
// Laddar först när panelen öppnas (lazy) och provar olika branch/filnamn.
function ReadmePreview({ owner, repo, branch = "main" }: { owner: string; repo: string; branch?: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Vanliga filnamn + branches vi testar i turordning.
  const filenameCandidates = ["README.md", "README.MD", "readme.md"];
  const branchCandidates = Array.from(new Set([branch, "main", "master"].filter(Boolean))) as string[];
  const urlMakers = [
    (b: string, f: string) => `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${b}/${f}`,
    (b: string, f: string) => `https://raw.githubusercontent.com/${owner}/${repo}/${b}/${f}`,
  ];

  // Hämtar README-text (första som svarar 200) och renderar som HTML via marked.
  // Obs: använder dangerouslySetInnerHTML, kan vara bra att känna till XSS-risker vid extern content.
  async function load() {
    if (content || loading) return; // undvik dubbelhämtning
    setLoading(true); setErr(null);
    try {
      let okText: string | null = null;
      outer: for (const b of branchCandidates) {
        for (const f of filenameCandidates) {
          for (const make of urlMakers) {
            const res = await fetch(make(b, f));
            if (res.ok) { okText = await res.text(); break outer; }
          }
        }
      }
      if (!okText) throw new Error("Hittade ingen README i repots rot.");
      setContent(marked.parse(okText));
    } catch (e: any) {
      setErr(e?.message ?? "Okänt fel");
    } finally {
      setLoading(false);
    }
  }

  // Ladda först när användaren öppnar panelen (on-demand).
  useEffect(() => { if (open) load(); /* eslint-disable-next-line */ }, [open]);

  return (
    <div className="mt-3">
      {/* Knapp som togglar visningen av README-innehåll */}
      <button
        onClick={() => setOpen(v => !v)}
        className="px-3 py-2 rounded border text-sm hover:bg-black/5 dark:hover:bg-white/10"
        aria-expanded={open}
      >
        {open ? "Dölj kod" : "Visa kod här"}
      </button>

      {/* Panel med status, fel och renderad README */}
      {open && (
        <div className="mt-3 rounded-2xl border bg-gray-50 dark:bg-white/5 p-4 transition-all">
          {loading && <p className="text-sm text-gray-600 dark:text-gray-300">Laddar README…</p>}
          {err && <p className="text-sm text-red-600">Fel: {err}</p>}
          {content && <article className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />}
        </div>
      )}
    </div>
  );
}

// Projektsida med sök, tagg-filter, sortering och inline-README.
// Sidan läser även query-param från URL för att förifylla sökningen.
export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const paramQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(paramQuery);
  const [tag, setTag] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"updated" | "title">("updated");

  // Håller lokalt state i synk med URL:en när query-param ändras.
  useEffect(() => { setQuery(paramQuery); }, [paramQuery]);

  // Filtrering + sortering memoisieras för att slippa räkna om i onödan vid varje render.
  const filtered = useMemo(() => {
    let items = DATA.filter(
      (p) => (!tag || p.tags.includes(tag)) && p.title.toLowerCase().includes(query.toLowerCase())
    );
    items.sort((a, b) =>
      sortKey === "title" ? a.title.localeCompare(b.title) : b.updated.localeCompare(a.updated)
    );
    return items;
  }, [query, tag, sortKey]);

  return (
    <section className="space-y-6">
      {/* Rubrik + kort instruktion */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="h1-fancy">Projekt</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Klicka på ett kort för GitHub, eller “Visa kod här” för README inline.
          </p>
        </div>

        {/* Sök + Sortera (interaktivt UI) */}
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-3 py-2 bg-white/80 dark:bg-white/10"
            placeholder="Sök projekt…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2 bg-white/80 dark:bg-white/10"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
          >
            <option value="updated">Senast uppdaterad</option>
            <option value="title">Titel</option>
          </select>
        </div>
      </div>

      {/* Taggfilter, aria-pressed för tydligare tillgänglighet vid toggle */}
      <div className="flex flex-wrap gap-2">
        {ALL_TAGS.map((t) => (
          <button
            key={t}
            aria-pressed={tag === t}
            onClick={() => setTag(tag === t ? null : t)}
            className={`px-3 py-1 rounded border ${
              tag === t ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white/80 dark:bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Projektkort som länkar till GitHub, samt inline-läsning av README */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <li key={p.id} className="card-glass rounded-2xl p-4 flex flex-col shadow-sm">
            {/* Hela kortet länkar till repo (öppnas i ny flik) */}
            <Link href={p.githubUrl} target="_blank" rel="noreferrer" className="group flex-1">
              <div className="flex items-center gap-3">
                {/* Logga för projektet */}
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border bg-white group-hover:scale-[1.02] transition-transform">
                  <Image src={p.logo} alt={`${p.title} logga`} fill sizes="56px" className="object-contain p-1" />
                </div>
                <div>
                  <h2 className="font-semibold group-hover:underline">{p.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Uppdaterad: {p.updated}</p>
                </div>
              </div>

              {/* Kort beskrivning + taggar */}
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">{p.description}</p>
              <div className="mt-2 flex gap-1 flex-wrap">
                {p.tags.map((t) => (
                  <span key={t} className="text-xs border rounded px-2 py-0.5 bg-white/60 dark:bg-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </Link>

            {/* Knapp för att visa README utan att lämna sidan */}
            <ReadmePreview owner={p.owner} repo={p.repo} branch={p.branch ?? "main"} />
          </li>
        ))}
      </ul>
    </section>
  );
}
