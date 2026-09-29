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

`npm run check` runs ESLint, regression tests, TypeScript checking, and the production build. You can also run `npm run lint`, `npm test`, `npm run typecheck`, or `npm run build` individually. Tests use mocked APIs and do not request live feeds. GitHub Actions runs these checks for pushes and pull requests once this folder is hosted in a GitHub repository.

## Edit your information

- `lib/profile.ts`: name, role, headline, biography, contact details, account usernames, default public site URL. Profile links, initials, the phone link, page metadata, and the social preview derive from these settings.
- `app/page.tsx`: page composition.
- `app/globals.css`: layout, colors, and typography.
- `components/repository-feed.tsx`: live GitHub cards.
- `components/content-feeds.tsx`: live DEV.to articles.
- `lib/feeds.ts`: data validation, ordering, and public API URLs.
- `components/use-live-feed.ts` and `lib/live-feed.ts`: fresh requests, loading, errors, and retries.

## GitHub and DEV.to content

Both feeds start empty with a loading message. On each page load, the browser fetches GitHub repositories and DEV.to articles independently, bypassing its HTTP cache with `cache: 'no-store'`. Successful responses display automatically, with no saved snapshot or update-acceptance button. No rebuild is needed for new public content to appear on the next visit. The upstream APIs can still apply their own caching and rate limits.

The three most recently pushed repositories and the three newest articles are displayed. Repository cards use API names, descriptions, languages, stars, and last-push dates; forks and archived repositories are labeled. Article descriptions come directly from DEV.to. Links to the full source profiles remain available.

Requests time out after ten seconds and are cancelled when a feed unmounts. Errors display a retry button rather than old data. Empty responses show an empty-state message. Feeds require JavaScript; without it, visitors can use the GitHub and DEV.to links. No credentials are sent, and no private content is requested.

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

The site has semantic sections, a skip link, visible keyboard focus, minimum 44 px standalone action targets, wrapping layouts and rem-based text. Colors follow system light/dark appearance, with increased-contrast and forced-colors accommodations. Reduced motion disables smooth scrolling. External website links open in a new tab with `noopener noreferrer`, accessible labels, and hover hints. Page navigation stays in the current tab; email and phone links use `mailto:` and `tel:`.
