"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { marked } from "marked";

type SortKey = "updated" | "title";

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

/** Lokal data utan APIs */
const PROJECTS: Project[] = [
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

/* ---- README-komponent med robust fallback och korrekta deps/typer ---- */
function ReadmePreview({
  owner,
  repo,
  branch = "main",
}: {
  owner: string;
  repo: string;
  branch?: string;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || content || loading) return;

    let cancelled = false;

    async function fetchReadme() {
      setLoading(true);
      setErr(null);

      // Flyttat in i effekten så deps inte blir instabila
      const filenameCandidates = ["README.md", "README.MD", "readme.md"] as const;
      const branchCandidates = Array.from(
        new Set([branch, "main", "master"].filter(Boolean))
      ) as string[];
      const urlMakers = [
        (b: string, f: string) => `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${b}/${f}`,
        (b: string, f: string) => `https://raw.githubusercontent.com/${owner}/${repo}/${b}/${f}`,
      ] as const;

      try {
        let okText: string | null = null;

        outer: for (const b of branchCandidates) {
          for (const f of filenameCandidates) {
            for (const make of urlMakers) {
              const res = await fetch(make(b, f));
              if (res.ok) {
                okText = await res.text();
                break outer;
              }
            }
          }
        }

        if (!okText) throw new Error("Hittade ingen README i repots rot.");

        // marked.parse kan vara sync/async = vänta säkert
        const htmlMaybe = await Promise.resolve(marked.parse(okText));
        const html = typeof htmlMaybe === "string" ? htmlMaybe : String(htmlMaybe);

        if (!cancelled) setContent(html);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Okänt fel vid hämtning av README";
        if (!cancelled) setErr(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchReadme();
    return () => {
      cancelled = true;
    };
  }, [open, content, loading, owner, repo, branch]);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 rounded border text-sm hover:bg-black/5 dark:hover:bg-white/10"
        aria-expanded={open}
      >
        {open ? "Dölj kod" : "Visa kod här"}
      </button>
      {open && (
        <div className="mt-3 rounded-2xl border bg-gray-50 dark:bg-white/5 p-4 transition-all">
          {loading && (
            <p className="text-sm text-gray-600 dark:text-gray-300">Laddar README…</p>
          )}
          {err && <p className="text-sm text-red-600">Fel: {err}</p>}
          {content && (
            <article
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const paramQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(paramQuery);
  const [tag, setTag] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("updated");

  // Synka globalt sök (från top-nav) till lokalt fält
  useEffect(() => {
    setQuery(paramQuery);
  }, [paramQuery]);

  const allTags = useMemo(() => {
    return Array.from(new Set(PROJECTS.flatMap((p) => p.tags)));
  }, []);

  const filtered = useMemo(() => {
    const items = PROJECTS.filter(
      (p) =>
        (!tag || p.tags.includes(tag)) &&
        (p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()))
    );
    items.sort((a, b) =>
      sortKey === "title"
        ? a.title.localeCompare(b.title)
        : b.updated.localeCompare(a.updated)
    );
    return items;
  }, [query, tag, sortKey]);

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="h1-fancy">Projekt</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Klicka på ett kort för GitHub, eller “Visa kod här” för README inline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-3 py-2 bg-white/80 dark:bg-white/10"
            placeholder="Sök projekt…"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <select
            className="border rounded px-3 py-2 bg-white/80 dark:bg-white/10"
            value={sortKey}
            onChange={(e) => setSortKey(e.currentTarget.value as SortKey)}
          >
            <option value="updated">Senast uppdaterad</option>
            <option value="title">Titel</option>
          </select>
        </div>
      </div>

      {/* Taggar */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((t) => (
          <button
            key={t}
            aria-pressed={tag === t}
            onClick={() => setTag(tag === t ? null : t)}
            className={`px-3 py-1 rounded border ${
              tag === t
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white/80 dark:bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Kort lista */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <li
            key={p.id}
            className="card-glass rounded-2xl p-4 flex flex-col shadow-sm"
          >
            <Link
              href={p.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex-1"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border bg-white group-hover:scale-[1.02] transition-transform">
                  <Image
                    src={p.logo}
                    alt={`${p.title} logga`}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h2 className="font-semibold group-hover:underline">
                    {p.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Uppdaterad: {p.updated}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                {p.description}
              </p>
              <div className="mt-2 flex gap-1 flex-wrap">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs border rounded px-2 py-0.5 bg-white/60 dark:bg-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>

            {/* README inline */}
            <ReadmePreview
              owner={p.owner}
              repo={p.repo}
              branch={p.branch ?? "main"}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
