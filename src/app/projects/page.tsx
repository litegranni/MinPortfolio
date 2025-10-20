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

// ---- README-komponent med fallback (utan eslint-varningar) ----
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

  // Vanliga filnamn + branches i ordning
  const filenameCandidates = ["README.md", "README.MD", "readme.md"] as const;
  const branchCandidates = Array.from(
    new Set([branch, "main", "master"].filter(Boolean))
  ) as string[];

  // Ladda README först när panelen öppnas (lazy).
  // Har egen avbrytning för att undvika setState efter unmount.
  useEffect(() => {
    if (!open || content || loading) return;

    let cancelled = false;
    async function fetchReadme() {
      setLoading(true);
      setErr(null);

      const urlMakers = [
        (b: string, f: string) =>
          `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${b}/${f}`,
        (b: string, f: string) =>
          `https://raw.githubusercontent.com/${owner}/${repo}/${b}/${f}`,
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
        if (!cancelled) setContent(marked.parse(okText)); // rendera Markdown → HTML
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Okänt fel vid hämtning av README";
        if (!cancelled) setErr(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchReadme();
    return () => {
      cancelled = true;
    };
    // Obs: beroenden inkluderar props + candidates så logiken håller sig korrekt.
  }, [open, content, loading, owner, repo, branch, branchCandidates, filenameCandidates]);

  return (
    <div className="mt-3">
      {/* Toggla visning av README-innehåll */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 rounded border text-sm hover:bg-black/5 dark:hover:bg-white/10"
        aria-expanded={open}
      >
        {open ? "Dölj kod" : "Visa kod här"}
      </button>

      {/* Panel med status, fel och renderad README (dangerouslySetInnerHTML är ett medvetet val) */}
      {open && (
        <div className="mt-3 rounded-2xl border bg-gray-50 dark:bg-white/5 p-4 transition-all">
          {loading && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Laddar README…
            </p>
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

// Projekt-sida: hämtar via API, filtrerar, tagg-filtret, sortering, inline-README.
export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const paramQuery = searchParams.get("query") || "";

  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState(paramQuery);
  const [tag, setTag] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("updated");

  // Hämta projekt från API (no-store = alltid färskt, ica har något att ta efter här).
  // Cleanup-flagga för att undvika state-uppdateringar efter unmount.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (!res.ok) throw new Error(`API-fel ${res.status}`);
        const data: Project[] = await res.json();
        if (alive) {
          setProjects(data);
          setError(null);
        }
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Kunde inte hämta projekt.";
        if (alive) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Synka global söksträng från URL (top-nav) med lokalt state
  useEffect(() => {
    setQuery(paramQuery);
  }, [paramQuery]);

  // Samla alla taggar (unik lista) för prestanda
  const allTags = useMemo(() => {
    if (!projects) return [] as string[];
    return Array.from(new Set(projects.flatMap((p) => p.tags)));
  }, [projects]);

  // Filtrering + sortering, funktion för att undvika onödigt arbete vid re-render
  const filtered = useMemo(() => {
    if (!projects) return [] as Project[];
    const items = projects.filter(
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
  }, [projects, query, tag, sortKey]);

  return (
    <section className="space-y-6">
      {/* Rubrik + snabb instruktion */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="h1-fancy">Projekt</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Klicka på ett kort för GitHub, eller “Visa kod här” för README inline.
          </p>
        </div>

        {/* Sök + sortera (å ge feedback direkt i listan) */}
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

      {/* Taggfilter. aria-pressed ger tydligare a11ystatus */}
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

      {/* Laddnings- och felstatus, enkel feedback */}
      {loading && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Laddar projekt…
        </p>
      )}
      {error && <p className="text-sm text-red-600">Fel: {error}</p>}

      {/* Kort-lista, endast när det finns data och ingen error */}
      {!loading && !error && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="card-glass rounded-2xl p-4 flex flex-col shadow-sm"
            >
              {/* Kortet länkar till GitHub i ny flik */}
              <Link
                href={p.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex-1"
              >
                <div className="flex items-center gap-3">
                  {/* Logga/bild för projektet */}
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

                {/* Beskrivning + taggar */}
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

              {/* Inline README för snabb kodkoll utan att lämna sidan */}
              <ReadmePreview
                owner={p.owner}
                repo={p.repo}
                branch={p.branch ?? "main"}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
