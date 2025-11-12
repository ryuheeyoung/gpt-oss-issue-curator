export type IssueLevel = "first-timers" | "intermediate" | "advanced";

export type Issue = {
  id: string;
  title: string;
  repo: string;
  org: string;
  description: string;
  labels: string[];
  language: string;
  level: IssueLevel;
  link: string;
  stars: number;
  updatedAt: string;
  goodFirstIssue: boolean;
  topics: string[];
};

export type Collection = {
  id: string;
  title: string;
  description: string;
  criteria: string[];
  issueIds: string[];
};

export type MaintainerGuide = {
  org: string;
  repo: string;
  summary: string;
  setup: string[];
  etiquette: string[];
  gettingStarted: string;
  docsUrl: string;
};

export const curatedIssues: Issue[] = [
  {
    id: "astro-image-143",
    title: "Teach the image component how to lazy-load background images",
    repo: "withastro/astro",
    org: "Astro",
    description:
      "Explore the new media optimizations API surface and help the team land background lazy-loading.",
    labels: ["feature", "good first issue", "frontend"],
    language: "TypeScript",
    level: "first-timers",
    link: "https://github.com/withastro/astro/issues/11820",
    stars: 40000,
    updatedAt: "2024-06-30T09:32:00.000Z",
    goodFirstIssue: true,
    topics: ["astro", "images", "performance"],
  },
  {
    id: "next-auth-941",
    title: "Improve docs for custom OAuth providers with PKCE",
    repo: "nextauthjs/next-auth",
    org: "NextAuth.js",
    description:
      "We need a clearer walkthrough for PKCE-capable providers including example configs.",
    labels: ["docs", "help wanted"],
    language: "TypeScript",
    level: "first-timers",
    link: "https://github.com/nextauthjs/next-auth/issues/11860",
    stars: 20000,
    updatedAt: "2024-07-08T11:12:00.000Z",
    goodFirstIssue: true,
    topics: ["oauth", "docs", "auth"],
  },
  {
    id: "supabase-dashboard-231",
    title: "Dark mode polish for the storage explorer panel",
    repo: "supabase/supabase",
    org: "Supabase",
    description:
      "Audit storage explorer colors to make sure text and divider contrast meets AA.",
    labels: ["design", "help wanted"],
    language: "TypeScript",
    level: "intermediate",
    link: "https://github.com/supabase/supabase/issues/25206",
    stars: 60000,
    updatedAt: "2024-07-10T18:24:00.000Z",
    goodFirstIssue: false,
    topics: ["dashboard", "design", "dark mode"],
  },
  {
    id: "trpc-5011",
    title: "Add examples for testing vNext procedures with Vitest",
    repo: "trpc/trpc",
    org: "tRPC",
    description:
      "Author a recipe showing how to mock context and call procedures with Vitest in the new router.",
    labels: ["docs", "good first issue"],
    language: "TypeScript",
    level: "first-timers",
    link: "https://github.com/trpc/trpc/issues/5402",
    stars: 30000,
    updatedAt: "2024-07-03T15:11:00.000Z",
    goodFirstIssue: true,
    topics: ["testing", "vitest", "backend"],
  },
  {
    id: "pandas-554",
    title: "Document nullable dtypes interoperability with pyarrow",
    repo: "pandas-dev/pandas",
    org: "Pandas",
    description:
      "Clarify how new nullable dtypes behave when exporting to Arrow tables and point out caveats.",
    labels: ["docs", "help wanted"],
    language: "Python",
    level: "intermediate",
    link: "https://github.com/pandas-dev/pandas/issues/56806",
    stars: 42000,
    updatedAt: "2024-07-05T21:05:00.000Z",
    goodFirstIssue: false,
    topics: ["dataframe", "arrow", "docs"],
  },
  {
    id: "rust-clippy-912",
    title: "Lint suggestion: flag needless async move blocks",
    repo: "rust-lang/rust-clippy",
    org: "Rust Lang",
    description:
      "New lint idea that ensures async move is only used when the future actually moves captured values.",
    labels: ["enhancement", "good first issue"],
    language: "Rust",
    level: "intermediate",
    link: "https://github.com/rust-lang/rust-clippy/issues/12512",
    stars: 13000,
    updatedAt: "2024-06-27T07:52:00.000Z",
    goodFirstIssue: true,
    topics: ["compiler", "lint", "rust"],
  },
  {
    id: "langchain-221",
    title: "Provide streaming example with LlamaIndex connector",
    repo: "langchain-ai/langchain",
    org: "LangChain",
    description:
      "Add a cookbook recipe for streaming tokens into LangChain when the upstream model is LlamaIndex.",
    labels: ["docs", "examples"],
    language: "Python",
    level: "intermediate",
    link: "https://github.com/langchain-ai/langchain/issues/21505",
    stars: 70000,
    updatedAt: "2024-07-09T10:42:00.000Z",
    goodFirstIssue: false,
    topics: ["ai", "streaming", "python"],
  },
  {
    id: "remix-run-332",
    title: "Infer loader errors when using typed defer() helpers",
    repo: "remix-run/remix",
    org: "Remix",
    description:
      "Improve the DX of loader errors so defer helpers surface type-safe responses.",
    labels: ["typescript", "help wanted"],
    language: "TypeScript",
    level: "advanced",
    link: "https://github.com/remix-run/remix/issues/9226",
    stars: 26000,
    updatedAt: "2024-07-11T13:03:00.000Z",
    goodFirstIssue: false,
    topics: ["remix", "dx", "typescript"],
  },
  {
    id: "kubernetes-9441",
    title: "Expose scheduling metrics via the component-base stability gates",
    repo: "kubernetes/kubernetes",
    org: "Kubernetes",
    description:
      "Wire the new component-base stability API so scheduler metrics can be gated without custom feature flags.",
    labels: ["enhancement", "backend", "observability"],
    language: "Go",
    level: "advanced",
    link: "https://github.com/kubernetes/kubernetes/issues/126581",
    stars: 105000,
    updatedAt: "2024-07-12T08:41:00.000Z",
    goodFirstIssue: false,
    topics: ["k8s", "metrics", "scheduler"],
  },
  {
    id: "godot-physics-788",
    title: "Improve character controller docs for the new 4.3 physics backend",
    repo: "godotengine/godot-docs",
    org: "Godot",
    description:
      "Document how the revamped Slide and Move APIs behave when using the new physics backend, including code samples.",
    labels: ["docs", "good first issue"],
    language: "C++",
    level: "first-timers",
    link: "https://github.com/godotengine/godot-docs/issues/9060",
    stars: 70000,
    updatedAt: "2024-07-06T19:55:00.000Z",
    goodFirstIssue: true,
    topics: ["godot", "physics", "docs"],
  },
  {
    id: "nuxt-content-421",
    title: "Add MDX remark plugin recipe for Nuxt Content v3",
    repo: "nuxt/content",
    org: "Nuxt",
    description:
      "Show how to wire remark rehype plugins when mixing Content docs, MDX islands, and Nitro prerender.",
    labels: ["docs", "frontend", "examples"],
    language: "JavaScript",
    level: "intermediate",
    link: "https://github.com/nuxt/content/issues/2135",
    stars: 13000,
    updatedAt: "2024-07-02T16:04:00.000Z",
    goodFirstIssue: false,
    topics: ["nuxt", "mdx", "content"],
  },
  {
    id: "rails-async-229",
    title: "Make Action Mailbox ingress retries observable",
    repo: "rails/rails",
    org: "Rails",
    description:
      "Provide ActiveSupport notifications when Action Mailbox reruns failures so hosts can attach metrics.",
    labels: ["feature", "help wanted", "backend"],
    language: "Ruby",
    level: "intermediate",
    link: "https://github.com/rails/rails/issues/52074",
    stars: 56000,
    updatedAt: "2024-07-07T20:44:00.000Z",
    goodFirstIssue: false,
    topics: ["rails", "mailbox", "observability"],
  },
  {
    id: "flutter-ui-180",
    title: "Provide focus ring tokens for Material 3 baseline themes",
    repo: "flutter/flutter",
    org: "Flutter",
    description:
      "Audit the Material 3 defaults and expose focus ring color/shape tokens so apps can hit accessibility targets.",
    labels: ["design", "accessibility", "good first issue"],
    language: "Dart",
    level: "first-timers",
    link: "https://github.com/flutter/flutter/issues/152237",
    stars: 158000,
    updatedAt: "2024-07-08T05:18:00.000Z",
    goodFirstIssue: true,
    topics: ["flutter", "material", "a11y"],
  },
];

export const spotlightCollections: Collection[] = [
  {
    id: "docs-trail",
    title: "Docs Trailblazers",
    description:
      "Perfect for writers who love clarifying APIs. Every issue needs concise explanations and examples.",
    criteria: ["labels: docs OR examples", "high maintainer activity", "<= 2 files touched"],
    issueIds: curatedIssues
      .filter((issue) =>
        issue.labels.some((label) => label.includes("docs") || label.includes("examples")),
      )
      .map((issue) => issue.id),
  },
  {
    id: "frontend-polish",
    title: "Frontend Polish Fixes",
    description:
      "Tackle UI papercuts that create outsized delight. Expect design QA and Tailwind tweaks.",
    criteria: ["Stack: React/Next.js", "needs design review", "visual diffs requested"],
    issueIds: curatedIssues
      .filter((issue) => issue.labels.includes("design") || issue.labels.includes("frontend"))
      .map((issue) => issue.id),
  },
  {
    id: "typed-api",
    title: "Typed API Sheriffs",
    description:
      "If TypeScript diagnostics make you smile, these issues center on types and DX guardrails.",
    criteria: ["labels: typescript OR enhancement", "tests requested", "TS >= 5.5"],
    issueIds: curatedIssues
      .filter((issue) => issue.labels.includes("typescript") || issue.topics.includes("dx"))
      .map((issue) => issue.id),
  },
];

export const maintainerGuides: MaintainerGuide[] = [
  {
    org: "Astro",
    repo: "withastro/astro",
    summary:
      "Astro moves fast but labels issues meticulously. Expect a review from a DX engineer within 48h.",
    setup: ["pnpm install", "pnpm dev --host"],
    etiquette: [
      "Always run `pnpm lint` before pushing",
      "Screenshots or videos are required for visual work",
    ],
    gettingStarted: "The `packages/astro` workspace holds most compiler changes.",
    docsUrl: "https://docs.astro.build/en/contribute/",
  },
  {
    org: "Supabase",
    repo: "supabase/supabase",
    summary:
      "Design-oriented issues live in the studio package. The team loves small, scoped PRs that ship fast.",
    setup: ["pnpm install", "pnpm dev --filter studio"],
    etiquette: ["Open a draft PR early for visual tweaks", "Dark/light parity is mandatory"],
    gettingStarted: "The `studio` app is a Next.js workspace that mirrors production.",
    docsUrl: "https://supabase.com/docs/guides/contributing",
  },
  {
    org: "Rust Lang",
    repo: "rust-lang/rust-clippy",
    summary:
      "Clippy maintainers expect compiler fans to include tests and rationale for new lints.",
    setup: ["rustup toolchain install nightly", "cargo dev bless"],
    etiquette: ["Describe edge cases you considered", "Ensure suggestions compile"],
    gettingStarted: "Study prior lint PRs for structure; lint code lives in `clippy_lints`.",
    docsUrl: "https://github.com/rust-lang/rust-clippy#contributing",
  },
];

export const languages = Array.from(new Set(curatedIssues.map((issue) => issue.language))).sort();
export const levels: IssueLevel[] = ["first-timers", "intermediate", "advanced"];
export const labelFilters = Array.from(
  new Set(curatedIssues.flatMap((issue) => issue.labels)),
).sort();
