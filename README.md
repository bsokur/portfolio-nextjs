# Beka Sokurashvili

A personal portfolio built with Next.js App Router, React, TypeScript, and CSS. The introduction is followed by automatically fetched GitHub repositories and DEV.to articles.

## Run locally

Requires Node.js 24.11 or later. `.nvmrc` and CI use Node.js 24 LTS.

```sh
npm ci
npm run dev
```

Visit http://localhost:4173. You can choose another port with `npm run dev -- --port 3000`.

## Build

```sh
npm run check
```

Next.js exports the site to `out/`. It can be hosted by any static host. No database, account authentication, API tokens, or paid service is required.

`npm run check` runs ESLint, regression tests, TypeScript checking, and the production build. You can also run `npm run lint`, `npm test`, `npm run typecheck`, or `npm run build` individually. Tests use mocked APIs and temporary files; they do not request live feeds or modify the checked-in snapshot. GitHub Actions runs these checks for pushes and pull requests once this folder is hosted in a GitHub repository.

## Edit your information

- `lib/profile.ts`: name, role, headline, biography, contact details, account usernames, default public site URL, and optional article descriptions. Profile links, initials, the phone link, page metadata, and the social preview derive from these settings.
- `app/page.tsx`: page composition.
- `app/globals.css`: layout, colors, and typography.
- `components/repository-feed.tsx` and `lib/repository-feed-state.ts`: GitHub cards and explicit update handling.
- `components/content-feeds.tsx` and `lib/feed-state.ts`: article presentation and explicit update handling.
- `lib/feeds.ts`: data validation, ordering, and public API URLs.
- `lib/refresh-content.ts`: validated, atomic snapshot refresh.

## GitHub and DEV.to content

The three most recently pushed saved repositories render immediately. Each page load fetches up to 100 public repositories from GitHub, sorted by last push, and displays only the latest three. Cards use GitHub names, descriptions, languages, star counts, and last-push dates. Forks and archived repositories are labeled. Changes are offered through “Show updated repositories” so existing cards stay stable until accepted; empty lists populate automatically. The full collection remains available through the GitHub profile link.

The latest three saved articles render immediately, including without JavaScript. In the browser, DEV.to is checked once for fresh articles. Changed content is offered through “Show updated articles” and is applied only when selected, preserving the reading position and keyboard focus. Initially empty lists can populate immediately. Unchanged visible content does not prompt an update.

Requests time out after ten seconds. If either API is unavailable or rate-limited, its saved content remains visible with their actual snapshot date and a profile link. No credentials are sent in the public request. Private repositories and unpublished articles are never requested.

Refresh the snapshot before a new deployment:

```sh
npm run refresh-content
npm run build
```

If you change usernames in `lib/profile.ts`, refresh the snapshot before building. The refresh command retains both GitHub and DEV.to snapshots as validated source data; both feeds render from the snapshot before checking for updates in the browser. Both APIs must succeed, with no invalid or duplicate records, before the file is replaced. Any fetch or validation failure preserves the entire existing file and timestamp and exits with a nonzero code. A successful refresh writes to a temporary file and renames it into place, so a failed write cannot leave a truncated snapshot. Empty responses are valid and clear content for accounts that no longer have public items.

## Portrait

The original `assets/portrait.png` is the editable source. Run `npm run optimize-portrait` after replacing it to generate 192, 320, 416, and 624 px WebP variants in `public/images/`. The homepage uses these static variants through a custom Next Image loader; no runtime image service is needed. Keep the widths in `next.config.ts`, `lib/portrait-loader.ts`, and the optimization script aligned. The current variants range from 5.7 KB to 47.4 KB.

## Cloudflare Workers

The site uses Next.js static export and Workers Static Assets. `wrangler.jsonc` publishes only `out/`, preserves trailing-slash URLs, and serves the exported `404.html` for missing pages. No server-side Next.js adapter or Worker script is needed. Wrangler is pinned in the development dependencies and lockfile.

### GitHub deployment

1. Commit and push `wrangler.jsonc`, `package.json`, and `package-lock.json` together, along with any other source changes.
2. In Cloudflare, open **Workers & Pages > Create application > Continue with GitHub** and select `bsokur/portfolio-nextjs`.
3. Set the project name to **bsokur-dev**, matching `name` in `wrangler.jsonc`.
4. Use production branch **main**, build command **npm run build**, deploy command **npx wrangler deploy**, and preview command **npx wrangler preview**. Leave the root directory at the repository root. There is no output-directory form field: the Wrangler configuration specifies `out/`.
5. Use Node.js 24 (`.nvmrc`) and optionally set the build variable `SITE_URL=https://bsokur.dev`. This is already the default origin in the source.
6. Select **Deploy**. Subsequent pushes to the production branch trigger builds and deployments.
7. Open the deployed Worker, then **Settings > Domains & Routes > Add > Custom Domain**, and add `bsokur.dev`. The domain must be an active Cloudflare zone in the same account. Cloudflare provisions its DNS record and certificate.

The GitHub Actions workflow validates the app; Cloudflare's GitHub integration handles deployment separately. No Cloudflare token needs to be committed to this repository.

### Local verification and deployment

```sh
npm ci
npm run check
npm run deploy:check
npm run preview:cloudflare
```

`deploy:check` validates packaging without publishing. `preview:cloudflare` serves the already-built export locally through Wrangler. Rebuild after editing the site. To publish manually, authenticate with `npx wrangler login`, then run `npm run build` and `npm run deploy`.

Canonical URLs, social metadata, robots.txt, and sitemap.xml are generated at build time. Rebuild after changing the public domain. The original `assets/portrait.png`, source files, tests, and local configuration are not deployed; only `out/` is uploaded. `.wrangler/` and local secrets are excluded by `.gitignore`.

See [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/get-started/) and [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Accessibility

The site has semantic sections, a skip link, visible keyboard focus, minimum 44 px standalone action targets, wrapping layouts and rem-based text. Colors follow system light/dark appearance, with increased-contrast and forced-colors accommodations. Reduced motion disables smooth scrolling. External links use normal same-tab navigation so visitors retain browser choice; email and phone links use `mailto:` and `tel:`.
