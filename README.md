## OSS Issue Curator

**In English**

This experimental Next.js experience showcases what an "open source concierge" could look like.
It pulls from a curated dataset of real GitHub issues (cached locally for now) and layers on:

- Multi-criteria filtering (language, labels, experience level, saved issues, "good first" toggle)
- Live stats that react to filters so you can sense how deep the queue is
- Spotlight collections that group issues by contributor goals (docs, frontend polish, typed APIs)
- Maintainer cheat-sheets with setup, etiquette, and docs links before you open a PR
- Saved-issue side panel that lets you review your short list with full keyboard and screen-reader support.

The UI is purposely dense yet focused so you can find actionable work in minutes, not hours of scrolling.

**한국어**

이 실험적 Next.js 프로젝트는 오픈소스 ‘컨시어지’ 경험을 탐색하는 공간으로, 선별된 GitHub 이슈 데이터를 바탕으로 다음 기능을 제공합니다.

- 언어/라벨/난이도/저장 이슈/Good First 토글 등 다중 조건 필터링
- 필터에 따라 즉시 반응하는 실시간 통계
- 기여 목표별로 이슈를 묶어주는 스포트라이트 컬렉션
- 세팅·에티켓·문서 링크를 한 번에 볼 수 있는 메인테이너 가이드
- 저장한 이슈를 한눈에 훑을 수 있는 사이드 패널(키보드/스크린리더 지원)

“정보는 많지만 집중력은 잃지 않는” UI 철학으로, 몇 분 만에 실행 가능한 작업을 찾을 수 있도록 설계했습니다.

## Immediate experiments

- Persist saved 이슈/필터 상태를 LocalStorage에 저장해서 새로고침해도 컨텍스트를 유지하도록 만들기
- `src/lib/mock-data.ts`에 더 다양한 언어·레벨·라벨 조합을 넣어 필터링 결과를 풍성하게 확장하기
- Jest + React Testing Library 환경을 구성하고 `IssueExplorer` 필터 로직 중심으로 행동 테스트를 추가하기
- 키보드 포커스 링, 스크린리더 레이블, 대비 개선 등 접근성(A11y) 전반을 한 차례 정비하기

## Next experiments

- `CollectionShowcase`, `MaintainerGuides` 등 다른 섹션에도 키보드 탐색/스크린리더 테스트를 늘려 안정성 확보.
- 라이트 모드 혹은 색각 보정 모드를 토글로 제공해 대비 요구사항을 상황별로 충족시키기.
- GitHub Issues API를 호출하는 Route Handler를 만들어 mock 데이터와 실데이터를 전환 가능하게 만들기.

## Running locally

```bash
npm install
npm run dev
```

**In English**

Visit [http://localhost:3000](http://localhost:3000) to try it out. The curated dataset lives in
`src/lib/mock-data.ts`--feel free to swap in real API calls or your favorite repos.

**한국어**

위 명령을 실행한 뒤 [http://localhost:3000](http://localhost:3000)에 접속하면 바로 체험할 수 있습니다. 데이터는 `src/lib/mock-data.ts`에 있으므로 실제 API나 원하는 리포지터리로 쉽게 교체할 수 있어요.

## Deployment (GitHub Pages)

**In English**

- Push to `main` (or trigger the `Deploy to GitHub Pages` workflow manually) and GitHub Actions will run `npm run build` (configured with `output: "export"`) to publish the `out/` directory via Pages.
- On first use: Repository **Settings → Pages → Build and deployment** 에서 **Source = GitHub Actions**를 선택하면 이 워크플로우가 Pages 배포 파이프라인이 됩니다.
- 사이트 주소는 `https://<사용자>.github.io/<저장소>/` 형태이며, `next.config.ts`에서 `basePath`/`assetPrefix`를 해당 저장소명으로 맞춰놨습니다 (기본값: `/gpt-oss-issue-curator`).
- 변경사항을 검증하려면 로컬에서 `npm run build`(또는 동등한 `npm run export`)로 `out/` 폴더를 생성해 정적 결과물을 확인할 수 있습니다.

**한국어**

- `main` 브랜치에 푸시하거나 워크플로우를 수동 실행하면 GitHub Actions가 `npm run build`를 돌린 뒤 `out/` 폴더를 Pages에 업로드합니다.
- 최초 설정 시 **Settings → Pages**에서 Source를 **GitHub Actions**로 지정해야 자동 배포가 작동합니다.
- 배포 URL은 `https://<사용자>.github.io/<저장소>/` 형태이며, `next.config.ts`에 기본값(`/gpt-oss-issue-curator`)으로 맞춰 둔 `basePath`/`assetPrefix`를 상황에 따라 수정할 수 있습니다.
- 로컬에서 `npm run build`로 만들어지는 `out/` 폴더를 확인하면 실제 배포본을 사전에 검증할 수 있습니다.

## Building from here

**In English**

- Hook up GitHub's search API via a Route Handler and cache responses (Upstash Redis / Vercel KV).
- Persist saved issues + notification rules using Supabase or Neon.
- Let users publish their own collections and share them as deep links.
- Enrich maintainer intel with contribution graphs, release cadence, or Discord links.

**한국어**

- GitHub Search API를 Route Handler로 감싸고 캐시(Upstash Redis / Vercel KV 등)를 붙여 실데이터와 연동할 수 있습니다.
- Supabase / Neon 등을 사용해 저장한 이슈나 알림 규칙을 영구적으로 보관할 수 있습니다.
- 사용자가 자신의 컬렉션을 만들고 딥링크로 공유하도록 확장할 수 있습니다.
- 기여 가이드에 릴리즈 주기, 그래프, Discord 링크 등을 추가해 더 깊은 컨텍스트를 제공할 수 있습니다.

Contributions and wild ideas are welcome!

기여와 실험적인 아이디어는 언제든 환영합니다!
