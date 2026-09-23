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

## Cloudflare Pages

This project uses Next.js static export. No Worker, server runtime, or Next.js adapter is required.

For a manual upload:

1. Run `npm run check`.
2. In Cloudflare, open **Workers & Pages**, choose **Create application**, then **Get started** under Pages and **Drag and drop your files**.
3. Upload the contents of `out/` as your site. Do not upload the project root, `node_modules`, source files, or `.next`.
4. In the Pages project's **Custom domains** settings, add `bsokur.dev` and follow Cloudflare's DNS instructions.

For Git-based builds, select **Next.js (Static HTML Export)**, set the build command to `npm run build`, and the build output directory to `out`. Use Node.js 24.11 or later (`NODE_VERSION=24.11.0` if setting it explicitly).

The default public origin is `https://bsokur.dev`. To use another domain, set `SITE_URL` in the build environment; see `.env.example`. Rebuild after changing the domain because canonical URLs, social metadata, `robots.txt`, and `sitemap.xml` are generated at build time. Cloudflare Pages uses the exported top-level `404.html` for missing pages.

Only `out/` is deployable output. Keep `assets/portrait.png` for future image changes; the original is outside `public/` and is not included in uploads. Dependencies, caches, and generated files are ignored by Git. Tests, CI, and the bundled font license remain part of the maintained project.

See [Cloudflare's static Next.js guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) and [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/). Choose manual upload or Git integration when creating the project; switching later requires a new Pages project.

## Accessibility

The site has semantic sections, a skip link, visible keyboard focus, minimum 44 px standalone action targets, wrapping layouts and rem-based text. Colors follow system light/dark appearance, with increased-contrast and forced-colors accommodations. Reduced motion disables smooth scrolling. External links use normal same-tab navigation so visitors retain browser choice; email and phone links use `mailto:` and `tel:`.
