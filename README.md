## OSS Issue Curator

This experimental Next.js experience showcases what an "open source concierge" could look like.
It pulls from a curated dataset of real GitHub issues (cached locally for now) and layers on:

- Multi-criteria filtering (language, labels, experience level, saved issues, "good first" toggle)
- Live stats that react to filters so you can sense how deep the queue is
- Spotlight collections that group issues by contributor goals (docs, frontend polish, typed APIs)
- Maintainer cheat-sheets with setup, etiquette, and docs links before you open a PR

The UI is purposely dense yet focused so you can find actionable work in minutes, not hours of scrolling.

## Immediate experiments

- Persist saved 이슈/필터 상태를 LocalStorage에 저장해서 새로고침해도 컨텍스트를 유지하도록 만들기
- `src/lib/mock-data.ts`에 더 다양한 언어·레벨·라벨 조합을 넣어 필터링 결과를 풍성하게 확장하기
- Jest + React Testing Library 환경을 구성하고 `IssueExplorer` 필터 로직 중심으로 행동 테스트를 추가하기
- 키보드 포커스 링, 스크린리더 레이블, 대비 개선 등 접근성(A11y) 전반을 한 차례 정비하기

## Running locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to try it out. The curated dataset lives in
`src/lib/mock-data.ts`--feel free to swap in real API calls or your favorite repos.

## Deployment (GitHub Pages)

- Push to `main` (or trigger the `Deploy to GitHub Pages` workflow manually) and GitHub Actions will run `npm run build` (configured with `output: "export"`) to publish the `out/` directory via Pages.
- On first use: Repository **Settings → Pages → Build and deployment** 에서 **Source = GitHub Actions**를 선택하면 이 워크플로우가 Pages 배포 파이프라인이 됩니다.
- 사이트 주소는 `https://<사용자>.github.io/<저장소>/` 형태이며, 필요하면 `next.config.ts`에 `assetPrefix/basePath`를 설정해 맞춰주세요.
- 변경사항을 검증하려면 로컬에서 `npm run build`(또는 동등한 `npm run export`)로 `out/` 폴더를 생성해 정적 결과물을 확인할 수 있습니다.

## Building from here

- Hook up GitHub's search API via a Route Handler and cache responses (Upstash Redis / Vercel KV).
- Persist saved issues + notification rules using Supabase or Neon.
- Let users publish their own collections and share them as deep links.
- Enrich maintainer intel with contribution graphs, release cadence, or Discord links.

Contributions and wild ideas are welcome!
