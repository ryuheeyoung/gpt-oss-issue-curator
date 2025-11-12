"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  curatedIssues,
  labelFilters,
  languages,
  levels,
  type Issue,
  type IssueLevel,
} from "@/lib/mock-data";

type LevelFilter = IssueLevel | "all";
const STORAGE_KEY = "oss-issue-curator:issue-explorer";

type PersistedExplorerState = {
  query: string;
  language: string;
  labels: string[];
  level: LevelFilter;
  onlyGFI: boolean;
  showSavedOnly: boolean;
  savedIssueIds: string[];
};

const isValidLevelFilter = (value: unknown): value is LevelFilter =>
  value === "all" || (typeof value === "string" && levels.includes(value as IssueLevel));

const formatRelativeTime = (isoDate: string) => {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "today";
  }

  if (diffDays === 1) {
    return "1 day ago";
  }

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} mo ago`;
  }

  return `${Math.floor(diffMonths / 12)} yr ago`;
};

const issueMatches = (
  issue: Issue,
  query: string,
  language: string,
  selectedLabels: string[],
  level: LevelFilter,
  onlyGFI: boolean,
) => {
  const matchesQuery =
    query.length === 0 ||
    issue.title.toLowerCase().includes(query) ||
    issue.description.toLowerCase().includes(query) ||
    issue.repo.toLowerCase().includes(query);

  const matchesLanguage = language === "all" || issue.language === language;
  const matchesLevel = level === "all" || issue.level === level;
  const matchesLabels =
    selectedLabels.length === 0 ||
    selectedLabels.every((label) => issue.labels.includes(label));
  const matchesGFI = !onlyGFI || issue.goodFirstIssue;

  return (
    matchesQuery && matchesLanguage && matchesLevel && matchesLabels && matchesGFI
  );
};

export function IssueExplorer() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("all");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [level, setLevel] = useState<LevelFilter>("all");
  const [onlyGFI, setOnlyGFI] = useState(false);
  const [savedIssueIds, setSavedIssueIds] = useState<Set<string>>(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PersistedExplorerState>;
        if (typeof parsed.query === "string") {
          setQuery(parsed.query);
        }
        if (typeof parsed.language === "string") {
          setLanguage(parsed.language);
        }
        if (Array.isArray(parsed.labels)) {
          setSelectedLabels(parsed.labels);
        }
        if (isValidLevelFilter(parsed.level)) {
          setLevel(parsed.level);
        }
        if (typeof parsed.onlyGFI === "boolean") {
          setOnlyGFI(parsed.onlyGFI);
        }
        if (typeof parsed.showSavedOnly === "boolean") {
          setShowSavedOnly(parsed.showSavedOnly);
        }
        if (Array.isArray(parsed.savedIssueIds)) {
          setSavedIssueIds(new Set(parsed.savedIssueIds));
        }
      }
    } catch {
      // Ignore malformed storage entries and fall back to defaults.
    } finally {
      hasHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydrated.current) {
      return;
    }

    const payload: PersistedExplorerState = {
      query,
      language,
      labels: selectedLabels,
      level,
      onlyGFI,
      showSavedOnly,
      savedIssueIds: Array.from(savedIssueIds),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    language,
    level,
    onlyGFI,
    query,
    selectedLabels,
    showSavedOnly,
    savedIssueIds,
  ]);

  const filteredIssues = useMemo(
    () =>
      curatedIssues.filter((issue) => {
        if (showSavedOnly && !savedIssueIds.has(issue.id)) {
          return false;
        }
        return issueMatches(
          issue,
          query.toLowerCase().trim(),
          language,
          selectedLabels,
          level,
          onlyGFI,
        );
      }),
    [language, level, onlyGFI, query, selectedLabels, showSavedOnly, savedIssueIds],
  );

  const stats = useMemo(() => {
    const orgs = new Set(filteredIssues.map((issue) => issue.org));
    const gfiCount = filteredIssues.filter((issue) => issue.goodFirstIssue).length;
    const pythonShare =
      filteredIssues.length === 0
        ? 0
        : Math.round(
            (filteredIssues.filter((issue) => issue.language === "Python").length /
              filteredIssues.length) *
              100,
          );

    return {
      total: filteredIssues.length,
      orgs: orgs.size,
      gfiCount,
      pythonShare,
    };
  }, [filteredIssues]);

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  };

  const toggleSavedIssue = (issueId: string) => {
    setSavedIssueIds((prev) => {
      const next = new Set(prev);
      if (next.has(issueId)) {
        next.delete(issueId);
      } else {
        next.add(issueId);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setQuery("");
    setLanguage("all");
    setSelectedLabels([]);
    setLevel("all");
    setOnlyGFI(false);
    setShowSavedOnly(false);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-900/20 backdrop-blur">
      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-400">Filters</p>
            <p className="text-lg font-semibold text-white">Narrow down the perfect issue</p>
          </div>

          <label className="space-y-2">
            <span className="text-xs font-medium text-zinc-400">Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Keywords, repo, label..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-zinc-400">Language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="all">Any language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400">Labels</p>
            <div className="flex flex-wrap gap-2">
              {labelFilters.map((label) => (
                <button
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selectedLabels.includes(label)
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-50"
                      : "border-white/10 text-zinc-400 hover:border-emerald-400/60 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400">Level</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLevel("all")}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  level === "all"
                    ? "bg-white text-black"
                    : "border border-white/10 text-zinc-400 hover:border-emerald-400/60 hover:text-white"
                }`}
              >
                All
              </button>
              {levels.map((levelOption) => (
                <button
                  key={levelOption}
                  onClick={() => setLevel(levelOption)}
                  className={`rounded-full px-3 py-1 text-xs capitalize transition ${
                    level === levelOption
                      ? "bg-emerald-500 text-emerald-950"
                      : "border border-white/10 text-zinc-400 hover:border-emerald-400/60 hover:text-white"
                  }`}
                >
                  {levelOption.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={onlyGFI}
                onChange={() => setOnlyGFI((value) => !value)}
                className="size-4 rounded border border-white/30 bg-white/10 accent-emerald-500"
              />
              Show only good first issue
            </label>

            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={showSavedOnly}
                onChange={() => setShowSavedOnly((value) => !value)}
                className="size-4 rounded border border-white/30 bg-white/10 accent-emerald-500"
              />
              Show saved issues
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400">
            <p className="text-sm font-semibold text-white">Live stats</p>
            <ul className="mt-3 space-y-1">
              <li className="flex justify-between">
                <span>Surface issues</span>
                <span className="font-semibold text-emerald-300">{stats.total}</span>
              </li>
              <li className="flex justify-between">
                <span>Active orgs</span>
                <span className="font-semibold text-emerald-300">{stats.orgs}</span>
              </li>
              <li className="flex justify-between">
                <span>Labeled good first</span>
                <span className="font-semibold text-emerald-300">{stats.gfiCount}</span>
              </li>
              <li className="flex justify-between">
                <span>Python share</span>
                <span className="font-semibold text-emerald-300">{stats.pythonShare}%</span>
              </li>
            </ul>
          </div>

          <button
            onClick={resetFilters}
            className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-white transition hover:border-emerald-400 hover:bg-emerald-500/10"
          >
            Reset filters
          </button>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-400">
                Curated feed
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {filteredIssues.length > 0
                  ? "Pick an issue that matches your energy"
                  : "Nothing matches these filters"}
              </h2>
              <p className="text-sm text-zinc-400">
                {filteredIssues.length} of {curatedIssues.length} issues visible
              </p>
            </div>

            {savedIssueIds.size > 0 && (
              <div className="rounded-full border border-emerald-400/40 px-4 py-1 text-sm text-emerald-200">
                {savedIssueIds.size} saved
              </div>
            )}
          </div>

          <div className="space-y-4">
            {filteredIssues.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
                Try relaxing a filter or clearing saved-only mode to reveal more issues.
              </div>
            )}

            {filteredIssues.map((issue) => {
              const isSaved = savedIssueIds.has(issue.id);
              return (
                <article
                  key={issue.id}
                  className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 transition hover:border-emerald-400/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-zinc-400">{issue.repo}</p>
                      <h3 className="text-xl font-semibold text-white">{issue.title}</h3>
                    </div>
                    <button
                      onClick={() => toggleSavedIssue(issue.id)}
                      className={`rounded-full px-4 py-1 text-sm font-medium transition ${
                        isSaved
                          ? "bg-emerald-500 text-emerald-950"
                          : "border border-white/10 text-white hover:border-emerald-400/60"
                      }`}
                      aria-pressed={isSaved}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </button>
                  </div>

                  <p className="mt-2 text-sm text-zinc-300">{issue.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-400">
                      {issue.language}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 capitalize text-zinc-400">
                      {issue.level.replace("-", " ")}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-400">
                      * {issue.stars.toLocaleString()} stars
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-400">
                      Updated {formatRelativeTime(issue.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-emerald-200">
                    {issue.labels.map((label) => (
                      <span key={label} className="rounded-full bg-emerald-500/10 px-3 py-1">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <a
                      href={issue.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-black transition hover:bg-emerald-200"
                    >
                      View issue
                      <span aria-hidden>-&gt;</span>
                    </a>
                    <div className="text-zinc-400">
                      Topics: {issue.topics.slice(0, 3).join(", ")}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
