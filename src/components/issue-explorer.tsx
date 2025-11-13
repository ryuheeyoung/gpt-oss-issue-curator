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

/**
 * 업데이트 날짜를 상대적인 표현(today, 3 days ago 등)으로 변환
 *
 * @param isoDate ISO-8601 형식의 날짜 문자열
 * @returns 상대적인 시간 표현
 */
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

/**
 * 필터 조건과 이슈가 매칭되는지 판단하는 순수 함수
 *
 * @param issue 비교 대상 이슈
 * @param query 소문자로 정규화된 검색어
 * @param language 선택된 언어 필터
 * @param selectedLabels 선택된 라벨 목록
 * @param level 난이도 필터
 * @param onlyGFI good first issue만 표시할지 여부
 */
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

/**
 * 필터, 상태 저장, 결과 리스트를 모두 포함한 메인 이슈 탐색기 컴포넌트
 *
 * 클라이언트 컴포넌트로 동작하며 로컬 스토리지에 필터 상태를 동기화합니다.
 */
export function IssueExplorer() {
  const headingId = "issue-explorer-heading";
  const statsHeadingId = "issue-explorer-stats";
  const visibilitySummaryId = "issue-explorer-visibility";
  const savedPanelHeadingId = "issue-explorer-saved-heading";
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("all");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [level, setLevel] = useState<LevelFilter>("all");
  const [onlyGFI, setOnlyGFI] = useState(false);
  const [savedIssueIds, setSavedIssueIds] = useState<Set<string>>(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [activeSavedIssueId, setActiveSavedIssueId] = useState<string | null>(null);
  const hasHydrated = useRef(false);

  /**
   * 초기 마운트 시 로컬 스토리지에 저장된 사용자 설정을 복원
   */
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

  const savedIssues = useMemo(
    () => curatedIssues.filter((issue) => savedIssueIds.has(issue.id)),
    [savedIssueIds],
  );
  const activeSavedIssue =
    savedIssues.find((issue) => issue.id === activeSavedIssueId) ?? null;

  /**
   * 필터 상태가 바뀌면 로컬 스토리지에 저장해 새로고침 후에도 컨텍스트 유지
   */
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

  useEffect(() => {
    if (!isSavedPanelOpen || savedIssues.length === 0) {
      return;
    }
    if (!activeSavedIssueId || !savedIssueIds.has(activeSavedIssueId)) {
      setActiveSavedIssueId(savedIssues[0].id);
    }
  }, [activeSavedIssueId, isSavedPanelOpen, savedIssueIds, savedIssues]);

  useEffect(() => {
    if (savedIssues.length === 0 && isSavedPanelOpen) {
      setIsSavedPanelOpen(false);
      setActiveSavedIssueId(null);
    }
  }, [isSavedPanelOpen, savedIssues.length]);

  useEffect(() => {
    if (!isSavedPanelOpen || typeof window === "undefined") {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSavedPanelOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSavedPanelOpen]);

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

  /**
   * 라벨 버튼 토글 시 선택 목록을 업데이트
   *
   * @param label 토글 대상 라벨 이름
   */
  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  };

  /**
   * 개별 이슈를 저장/해제하면서 저장된 ID 집합을 갱신
   *
   * @param issueId 토글할 이슈 ID
   */
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

  /**
   * 사용자가 빠르게 초기 상태로 돌아갈 수 있도록 모든 필터를 리셋
   */
  const resetFilters = () => {
    setQuery("");
    setLanguage("all");
    setSelectedLabels([]);
    setLevel("all");
    setOnlyGFI(false);
    setShowSavedOnly(false);
  };

  /**
   * 저장된 이슈 패널을 닫고 상태를 원복
   */
  const closeSavedPanel = () => {
    setIsSavedPanelOpen(false);
  };

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-900/20 backdrop-blur"
    >
      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="space-y-6 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-400">Filters</p>
            <p className="text-lg font-semibold text-white">Narrow down the perfect issue</p>
          </div>

          <label className="space-y-2">
            <span className="text-xs font-medium text-zinc-200">Search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Keywords, repo, label..."
              aria-label="Search issues"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-zinc-200">Language</span>
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

          <fieldset className="space-y-2 border-0 p-0">
            <legend className="text-xs font-medium text-zinc-200">Labels</legend>
            <div className="flex flex-wrap gap-2" aria-label="Filter by label">
              {labelFilters.map((label) => {
                const isActive = selectedLabels.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-3 py-1 text-xs transition focus:border-emerald-300 ${
                      isActive
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-50"
                        : "border-white/10 text-zinc-200 hover:border-emerald-400/60 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-2 border-0 p-0">
            <legend className="text-xs font-medium text-zinc-200">Level</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by difficulty level">
              <button
                type="button"
                onClick={() => setLevel("all")}
                aria-pressed={level === "all"}
                className={`rounded-full px-3 py-1 text-xs transition focus:border-emerald-300 ${
                  level === "all"
                    ? "bg-white text-black"
                    : "border border-white/10 text-zinc-200 hover:border-emerald-400/60 hover:text-white"
                }`}
              >
                All
              </button>
              {levels.map((levelOption) => {
                const isActive = level === levelOption;
                return (
                  <button
                    key={levelOption}
                    type="button"
                    onClick={() => setLevel(levelOption)}
                    aria-pressed={isActive}
                    className={`rounded-full px-3 py-1 text-xs capitalize transition focus:border-emerald-300 ${
                      isActive
                        ? "bg-emerald-500 text-emerald-950"
                        : "border border-white/10 text-zinc-200 hover:border-emerald-400/60 hover:text-white"
                    }`}
                  >
                    {levelOption.replace("-", " ")}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-zinc-100">
              <input
                type="checkbox"
                checked={onlyGFI}
                onChange={() => setOnlyGFI((value) => !value)}
                className="size-4 rounded border border-white/30 bg-white/10 accent-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/80"
              />
              Show only good first issue
            </label>

            <label className="flex items-center gap-3 text-sm text-zinc-100">
              <input
                type="checkbox"
                checked={showSavedOnly}
                onChange={() => setShowSavedOnly((value) => !value)}
                className="size-4 rounded border border-white/30 bg-white/10 accent-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/80"
              />
              Show saved issues
            </label>
          </div>

          <div
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-100"
            role="region"
            aria-live="polite"
            aria-labelledby={statsHeadingId}
          >
            <p id={statsHeadingId} className="text-sm font-semibold text-white">
              Live stats
            </p>
            <p className="sr-only">Counts update automatically as you change filters.</p>
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
            type="button"
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
              <p
                id={visibilitySummaryId}
                role="status"
                aria-live="polite"
                className="text-sm text-zinc-200"
              >
                {filteredIssues.length} of {curatedIssues.length} issues visible
              </p>
            </div>

            {savedIssueIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-full border border-emerald-400/40 px-4 py-1 text-sm text-emerald-200"
                >
                  {savedIssueIds.size} saved
                </div>
                <button
                  type="button"
                  onClick={() => setIsSavedPanelOpen(true)}
                  className="rounded-full border border-emerald-300/50 px-4 py-1 text-sm text-white transition hover:border-emerald-200 hover:bg-emerald-500/10"
                >
                  Saved issue panel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {filteredIssues.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-200">
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
                      <p className="text-xs uppercase text-zinc-200">{issue.repo}</p>
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

                  <p className="mt-2 text-sm text-zinc-100">{issue.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">
                      {issue.language}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 capitalize text-zinc-200">
                      {issue.level.replace("-", " ")}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">
                      * {issue.stars.toLocaleString()} stars
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">
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
                      rel="noreferrer noopener"
                      aria-label={`View ${issue.title} on GitHub`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-black transition hover:bg-emerald-200"
                    >
                      View issue
                      <span aria-hidden>-&gt;</span>
                    </a>
                    <div className="text-zinc-200">
                      Topics: {issue.topics.slice(0, 3).join(", ")}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      {isSavedPanelOpen && savedIssues.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby={savedPanelHeadingId}
        >
          <button
            type="button"
            aria-label="Close saved issue panel"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeSavedPanel}
          />
          <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-zinc-950/95 p-6 text-sm shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-400">
                  Saved issues
                </p>
                <h2 id={savedPanelHeadingId} className="text-2xl font-semibold text-white">
                  Quick detail view
                </h2>
              </div>
              <button
                type="button"
                onClick={closeSavedPanel}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-white transition hover:border-red-300 hover:text-red-200"
              >
                Close
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-4 lg:flex-row">
              <ul
                className="flex-1 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white"
                aria-label="Saved issue list"
              >
                {savedIssues.map((issue) => (
                  <li key={issue.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSavedIssueId(issue.id)}
                      className={`w-full rounded-xl px-3 py-2 text-left transition ${
                        issue.id === activeSavedIssueId
                          ? "bg-emerald-500 text-emerald-950"
                          : "bg-transparent text-white hover:bg-white/10"
                      }`}
                      aria-current={issue.id === activeSavedIssueId}
                    >
                      <span className="block text-[11px] uppercase text-emerald-200">
                        {issue.repo}
                      </span>
                      <span className="block text-sm font-semibold">{issue.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {activeSavedIssue && (
                <div className="flex-1 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
                  <div>
                    <p className="text-xs uppercase text-zinc-300">
                      Updated {formatRelativeTime(activeSavedIssue.updatedAt)}
                    </p>
                    <h3 className="text-lg font-semibold">{activeSavedIssue.title}</h3>
                    <p className="mt-2 text-sm text-zinc-100">{activeSavedIssue.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">
                      {activeSavedIssue.language}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 capitalize text-zinc-200">
                      {activeSavedIssue.level.replace("-", " ")}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">
                      {activeSavedIssue.labels.join(", ")}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-emerald-100">
                    <p className="font-semibold uppercase tracking-wide text-emerald-300">
                      Topics
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {activeSavedIssue.topics.map((topic) => (
                        <li
                          key={topic}
                          className="rounded-full border border-emerald-400/50 px-3 py-1"
                        >
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={activeSavedIssue.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-200"
                    >
                      View on GitHub
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleSavedIssue(activeSavedIssue.id)}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-red-300 hover:text-red-200"
                    >
                      Remove from saved
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
