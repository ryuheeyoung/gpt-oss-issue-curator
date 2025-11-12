import { CollectionShowcase } from "@/components/collection-showcase";
import { IssueExplorer } from "@/components/issue-explorer";
import { MaintainerGuides } from "@/components/maintainer-guides";
import {
  curatedIssues,
  maintainerGuides,
  spotlightCollections,
} from "@/lib/mock-data";

export default function Home() {
  const languages = new Set(curatedIssues.map((issue) => issue.language));
  const orgs = new Set(curatedIssues.map((issue) => issue.org));
  const goodFirstCount = curatedIssues.filter((issue) => issue.goodFirstIssue).length;

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute inset-x-0 -top-32 h-72 bg-gradient-to-b from-emerald-500/30 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-cyan-500/20 blur-[160px]" />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900/80 p-10 shadow-2xl shadow-emerald-900/20">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">
            OSS Issue Curator
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Match contributors with meaningful issues in one focused feed
            </h1>
            <p className="text-lg text-zinc-300 sm:max-w-3xl">
              We hand-pick issues with clear scope, mentoring-friendly maintainers, and actionable
              next steps. Filter by stack, labels, and level to find your next contribution in
              minutes, not hours of scrolling.
            </p>
          </div>

          <div className="grid gap-4 text-sm text-white sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400">Active orgs</p>
              <p className="mt-2 text-3xl font-semibold">{orgs.size}</p>
              <p className="text-zinc-400">Projects with ready-to-ship issues</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400">Stacks covered</p>
              <p className="mt-2 text-3xl font-semibold">{languages.size}</p>
              <p className="text-zinc-400">Languages represented this week</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400">Good first issues</p>
              <p className="mt-2 text-3xl font-semibold">{goodFirstCount}</p>
              <p className="text-zinc-400">Mentor-backed starters</p>
            </div>
          </div>
        </header>

        <IssueExplorer />

        <CollectionShowcase collections={spotlightCollections} issues={curatedIssues} />

        <MaintainerGuides guides={maintainerGuides} />
      </main>
    </div>
  );
}
