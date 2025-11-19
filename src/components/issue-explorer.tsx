"use client";

import { createPortal } from "react-dom";
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
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("all");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [level, setLevel] = useState<LevelFilter>("all");
  const [onlyGFI, setOnlyGFI] = useState(false);
  const [savedIssueIds, setSavedIssueIds] = useState<Set<string>>(new Set());
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [activeSavedIssueId, setActiveSavedIssueId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(() =>
    typeof window === "undefined" ? 10 : window.innerWidth < 768 ? 6 : 10,
  );
  const [page, setPage] = useState(1);
  const hasHydrated = useRef(false);
  const sectionRef = useRef<HTMLElement | null>(null);

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
      savedIssueIds: Array.from(savedIssueIds),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    language,
    level,
    onlyGFI,
    query,
    selectedLabels,
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
    const handleResize = () => {
      const nextSize = window.innerWidth < 768 ? 6 : 10;
      setPageSize(nextSize);
      setPage(1);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, language, selectedLabels, level, onlyGFI]);

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
      curatedIssues.filter((issue) =>
        issueMatches(
          issue,
          query.toLowerCase().trim(),
          language,
          selectedLabels,
          level,
          onlyGFI,
        ),
      ),
    [language, level, onlyGFI, query, selectedLabels],
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

  const paginatedIssues = filteredIssues.slice(0, page * pageSize);
  const hasMore = filteredIssues.length > paginatedIssues.length;

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
    setPage(1);
  };

  /**
   * 저장된 이슈 패널을 닫고 상태를 원복
   */
  const closeSavedPanel = () => {
    setIsSavedPanelOpen(false);
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby={headingId}
      className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-900/20 backdrop-blur"
    >
      <div className="grid gap-6 overflow-hidden lg:grid-cols-[280px,1fr] lg:overflow-visible">
        <FilterSidebar
          query={query}
          setQuery={setQuery}
          language={language}
          setLanguage={setLanguage}
          selectedLabels={selectedLabels}
          toggleLabel={toggleLabel}
          level={level}
          setLevel={setLevel}
          onlyGFI={onlyGFI}
          setOnlyGFI={setOnlyGFI}
          stats={stats}
          resetFilters={resetFilters}
        />
        <IssueFeed
          issues={paginatedIssues}
          totalFiltered={filteredIssues.length}
          savedCount={savedIssueIds.size}
          savedIssueIds={savedIssueIds}
          toggleSavedIssue={toggleSavedIssue}
          formatRelativeTime={formatRelativeTime}
          hasMore={hasMore}
          onLoadMore={() => setPage((prev) => prev + 1)}
        />
      </div>
      <SavedIssuesButton
        count={savedIssueIds.size}
        onOpen={() => {
          if (window.innerWidth >= 1024) {
            try {
              sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            } catch {
              // noop
            }
          }
          setIsSavedPanelOpen(true);
        }}
      />
      <SavedIssuesPanel
        open={isSavedPanelOpen}
        savedIssues={savedIssues}
        activeId={activeSavedIssueId}
        activeIssue={activeSavedIssue}
        setActiveId={setActiveSavedIssueId}
        close={closeSavedPanel}
        toggleSavedIssue={toggleSavedIssue}
        formatRelativeTime={formatRelativeTime}
      />
    </section>
  );
}

type FilterSidebarProps = {
  query: string;
  setQuery: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  selectedLabels: string[];
  toggleLabel: (label: string) => void;
  level: LevelFilter;
  setLevel: (value: LevelFilter) => void;
  onlyGFI: boolean;
  setOnlyGFI: (value: boolean) => void;
  stats: { total: number; orgs: number; gfiCount: number; pythonShare: number };
  resetFilters: () => void;
};

function FilterSidebar({
  query,
  setQuery,
  language,
  setLanguage,
  selectedLabels,
  toggleLabel,
  level,
  setLevel,
  onlyGFI,
  setOnlyGFI,
  stats,
  resetFilters,
}: FilterSidebarProps) {
  return (
    <aside className="min-w-0 space-y-6 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 text-sm">
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
      </div>

      <div
        className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-100"
        role="region"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-white">Live stats</p>
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
  );
}

type IssueFeedProps = {
  issues: Issue[];
  totalFiltered: number;
  savedCount: number;
  savedIssueIds: Set<string>;
  toggleSavedIssue: (id: string) => void;
  formatRelativeTime: (isoDate: string) => string;
  hasMore: boolean;
  onLoadMore: () => void;
};

function IssueFeed({
  issues,
  totalFiltered,
  savedCount,
  savedIssueIds,
  toggleSavedIssue,
  formatRelativeTime,
  hasMore,
  onLoadMore,
}: IssueFeedProps) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-400">Curated feed</p>
          <h2 className="text-2xl font-semibold text-white">
            {totalFiltered > 0 ? "Pick an issue that matches your energy" : "Nothing matches these filters"}
          </h2>
          <p className="text-sm text-zinc-200">
            {issues.length} of {totalFiltered} issues visible
          </p>
        </div>
        {savedCount > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-full border border-emerald-400/40 px-4 py-1 text-sm text-emerald-200"
          >
            {savedCount} saved
          </div>
        )}
      </div>

      <div className="space-y-4 pb-6">
        {totalFiltered === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-200">
            Try relaxing a filter or clearing saved-only mode to reveal more issues.
          </div>
        )}

        {issues.map((issue) => {
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
                    isSaved ? "bg-emerald-500 text-emerald-950" : "border border-white/10 text-white hover:border-emerald-400/60"
                  }`}
                  aria-pressed={isSaved}
                >
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
              <p className="mt-2 text-sm text-zinc-100">{issue.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">{issue.language}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 capitalize text-zinc-200">
                  {issue.level.replace("-", " ")}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">* {issue.stars.toLocaleString()} stars</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">Updated {formatRelativeTime(issue.updatedAt)}</span>
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
                <div className="text-zinc-200">Topics: {issue.topics.slice(0, 3).join(", ")}</div>
              </div>
            </article>
          );
        })}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onLoadMore}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-emerald-300 hover:text-emerald-200"
            >
              Load more issues
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const SavedIssuesButton = ({ count, onOpen }: { count: number; onOpen: () => void }) => {
  if (count === 0) {
    return null;
  }
  return (
    <div className="sticky bottom-6 z-40 mt-6 flex justify-end pr-6 lg:pr-0 pointer-events-none">
      <button
        type="button"
        onClick={onOpen}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400"
      >
        Saved issues
        <span className="rounded-full bg-emerald-700/20 px-2 text-xs text-emerald-900">{count}</span>
      </button>
    </div>
  );
};

type SavedIssuesPanelProps = {
  open: boolean;
  savedIssues: Issue[];
  activeId: string | null;
  activeIssue: Issue | null;
  setActiveId: (id: string) => void;
  close: () => void;
  toggleSavedIssue: (id: string) => void;
  formatRelativeTime: (iso: string) => string;
};

function SavedIssuesPanel({
  open,
  savedIssues,
  activeId,
  activeIssue,
  setActiveId,
  close,
  toggleSavedIssue,
  formatRelativeTime,
}: SavedIssuesPanelProps) {
  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || savedIssues.length === 0 || typeof document === "undefined") {
    return null;
  }

  const headingId = "saved-issues-heading";

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <button
        type="button"
        aria-label="Close saved issue panel"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />
      <aside className="relative z-10 mt-auto flex h-full w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-zinc-950/95 p-6 text-sm shadow-2xl shadow-black/60 lg:mt-0 lg:h-full lg:max-w-[420px] lg:self-end lg:rounded-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-400">
              Saved issues ({savedIssues.length})
            </p>
            <h2 id={headingId} className="text-2xl font-semibold text-white">
              Quick detail view
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-white transition hover:border-red-300 hover:text-red-200"
          >
            Close
          </button>
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-4 overflow-hidden">
          <ul
            className="max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white lg:max-h-[35%] lg:flex-none lg:shrink-0"
            aria-label="Saved issue list"
          >
            {savedIssues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(issue.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left transition ${
                    issue.id === activeId ? "bg-emerald-500 text-emerald-950" : "bg-transparent text-white hover:bg-white/10"
                  }`}
                  aria-current={issue.id === activeId}
                >
                  <span className="block text-[11px] uppercase text-emerald-200">{issue.repo}</span>
                  <span className="block text-sm font-semibold">{issue.title}</span>
                </button>
              </li>
            ))}
          </ul>
          {activeIssue && (
            <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
              <div>
                <p className="text-xs uppercase text-zinc-300">Updated {formatRelativeTime(activeIssue.updatedAt)}</p>
                <h3 className="text-lg font-semibold">{activeIssue.title}</h3>
                <p className="mt-2 text-sm text-zinc-100">{activeIssue.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">{activeIssue.language}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 capitalize text-zinc-200">
                  {activeIssue.level.replace("-", " ")}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-zinc-200">{activeIssue.labels.join(", ")}</span>
              </div>
              <div className="space-y-2 text-xs text-emerald-100">
                <p className="font-semibold uppercase tracking-wide text-emerald-300">Topics</p>
                <ul className="flex flex-wrap gap-2">
                  {activeIssue.topics.map((topic) => (
                    <li key={topic} className="rounded-full border border-emerald-400/50 px-3 py-1">
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={activeIssue.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-200"
                >
                  View on GitHub
                </a>
                <button
                  type="button"
                  onClick={() => toggleSavedIssue(activeIssue.id)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-red-300 hover:text-red-200"
                >
                  Remove from saved
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
