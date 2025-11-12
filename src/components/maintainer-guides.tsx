import type { MaintainerGuide } from "@/lib/mock-data";

type Props = {
  guides: MaintainerGuide[];
};

export function MaintainerGuides({ guides }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-amber-300">Maintainer intel</p>
        <h2 className="text-2xl font-semibold text-white">Know the vibe before you open a PR</h2>
        <p className="text-sm text-amber-100/80">
          Quick primers distilled from contributor guides so you can skip the guesswork.
        </p>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {guides.map((guide) => (
          <article
            key={guide.repo}
            className="flex flex-col rounded-2xl border border-amber-200/30 bg-amber-50/10 p-4 text-sm text-amber-50"
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-200">{guide.org}</p>
              <h3 className="text-lg font-semibold text-white">{guide.repo}</h3>
              <p className="mt-1 text-amber-100/80">{guide.summary}</p>
            </div>

            <div className="mt-4 space-y-3 text-amber-100/80">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-200">Setup pulse</p>
                <ul className="mt-1 space-y-1">
                  {guide.setup.map((step) => (
                    <li key={step} className="rounded border border-white/10 px-2 py-1">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-amber-200">Etiquette</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {guide.etiquette.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-3 text-xs italic text-amber-100/70">{guide.gettingStarted}</p>

            <a
              href={guide.docsUrl}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200/50 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-200/10"
            >
              Contribution guide -&gt;
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
