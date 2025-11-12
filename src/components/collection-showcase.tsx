import type { Collection, Issue } from "@/lib/mock-data";

type Props = {
  collections: Collection[];
  issues: Issue[];
};

export function CollectionShowcase({ collections, issues }: Props) {
  const issueLookup = new Map(issues.map((issue) => [issue.id, issue]));

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-zinc-950/60 p-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-cyan-400">Spotlight lists</p>
        <h2 className="text-2xl font-semibold text-white">Curated flows for popular goals</h2>
        <p className="text-sm text-zinc-400">
          These thematic bundles rotate weekly. Start with one that matches how you love to help.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {collections.map((collection) => (
          <article
            key={collection.id}
            className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                {collection.issueIds.length} issues
              </p>
              <h3 className="text-lg font-semibold text-white">{collection.title}</h3>
              <p className="mt-1 text-sm text-zinc-300">{collection.description}</p>
            </div>

            <ul className="mt-4 space-y-1 text-xs text-zinc-400">
              {collection.criteria.map((rule) => (
                <li key={rule} className="flex items-center gap-2">
                  <span className="text-cyan-300">-</span>
                  {rule}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-emerald-200">
              {collection.issueIds.slice(0, 3).map((id) => {
                const issue = issueLookup.get(id);
                if (!issue) return null;
                return (
                  <span
                    key={id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                  >
                    {issue.repo.split("/").pop()}
                  </span>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
