# Next.js + Contentstack template

A starting point for Contentstack sites: generic pages composed from reusable sections, a blog, and a header, footer and third-party scripts that editors configure without a deploy. Live Preview, webhook revalidation, SEO and the discovery routes are wired up already.

The content model ships as JSON, so a new project is a clone, an import and a token.

## Stack

| | |
|---|---|
| Framework | Next.js 16.4.3, App Router, Cache Components, Turbopack |
| UI | React 19, Tailwind CSS 4, shadcn/ui (`base-nova` style, **Base UI** primitives) |
| CMS | Contentstack, EU data center, `@contentstack/delivery-sdk` 5 |
| Tests | Vitest 5, Testing Library, jsdom |
| Package manager | pnpm (pinned via `packageManager`) |

## Getting started

```bash
pnpm install
cp .env.example .env.local        # then fill it in
pnpm content-model:import         # creates the content types in an empty stack
pnpm dev
```

`.env.example` documents every variable. Fill `.env.local` before the first request: the delivery client validates its configuration at module load and throws otherwise.

| Variable | Required | Notes |
|---|---|---|
| `CONTENTSTACK_API_KEY` | yes | Settings → Tokens → Stack API Key |
| `CONTENTSTACK_DELIVERY_TOKEN` | yes | Settings → Tokens → Delivery Tokens |
| `CONTENTSTACK_ENVIRONMENT` | yes | Must match an environment name |
| `CONTENTSTACK_REGION` | yes | `NA` `EU` `AU` `AZURE_NA` `AZURE_EU` `GCP_NA` `GCP_EU` |
| `CONTENTSTACK_WEBHOOK_SECRET` | yes | Shared with the webhook that calls `/api/revalidate` |
| `CONTENTSTACK_PREVIEW_TOKEN` | no | Enables Live Preview and the Visual Builder |
| `SITE_URL` | no | Absolute origin, see below |
| `CONTENTSTACK_MANAGEMENT_TOKEN` | no | Only for `content-model:import` |

`SITE_URL` is the absolute origin used by `robots.txt`, `sitemap.xml`, `llms.txt`, the AI catalog and `metadataBase`. It falls back to `VERCEL_PROJECT_PRODUCTION_URL` and then to `http://localhost:3000`. It is read **at build time**, because those routes are prerendered: setting it only at runtime leaves localhost urls baked into the output.

`CONTENTSTACK_REGION` is required on purpose. The SDK defaults to the US data center, so an unset region silently points a non-US stack at the wrong host.

None of these carry the `NEXT_PUBLIC_` prefix: every read happens on the server, including the Live Preview init, which receives the api key as a prop from a server component.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build, prerenders every known route |
| `pnpm typecheck` | `next typegen && tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest, single run |
| `pnpm test:watch` | Vitest, watch mode |
| `pnpm dev:https` | Dev server over https, required by the Live Preview iframe |
| `pnpm content-model:import` | Creates the content types and global field in the stack |

`typecheck` runs `next typegen` first because `LayoutProps` and `PageProps` are generated into `.next/types`. Plain `tsc` fails on a fresh clone.

## Content model

```
site_config (singleton)          header                  footer
├── site_name                    ├── title               ├── title
├── logo                         ├── logo                ├── navigation[]
├── default_header ──────────────┤ navigation[]          └── copyright
├── default_footer ──────────────┼─────────────────────────────┘
└── scripts                      ├── cta_label
    ├── gtm_container_id         └── cta_url
    ├── external_scripts[]
    └── inline_head_html

page                             blog_post               seo_metadata (global field)
├── title                        ├── title               ├── meta_title
├── url          "/" , "/about"  ├── url   "/blog/slug"  ├── meta_description
├── seo ─────────────────────────┤ cover_image           ├── og_image
├── header  (optional override)  ├── published_date      └── no_index
├── footer  (optional override)  ├── body (JSON RTE)
└── sections[] (modular blocks)  ├── blog_tags[]
    ├── hero                     └── seo ────────────────────────┘
    ├── rich_text
    ├── feature_grid
    └── post_list → blog_post
```

The schemas live in `content-model/`, one file per content type plus the global field. `pnpm content-model:import` posts them to the Management API in dependency order and skips anything that already exists, so it is safe to re-run after adding a type. It needs `CONTENTSTACK_MANAGEMENT_TOKEN`; nothing at runtime does.

Both `page` and `blog_post` are addressed by a full `url` rather than a slug, because that is the field the Live Preview panel resolves an entry by.

Decisions worth knowing:

- **One `page` type, not one per page.** Any route is an entry with a `url`, so a new page needs no deploy. The catch-all route resolves it.
- **Sections are modular blocks, not references.** They are page-local, have no independent lifecycle and are not reused, so references would add a reference hop and leave orphan entries for editors to clean up.
- **Header and footer are references.** They are edited once and appear across entries, which is the opposite case. `page.header` overrides `site_config.default_header`.
- **SEO is a global field** shared by `page` and `blog_post`, so metadata cannot drift between the two.

## Architecture

```
lib/contentstack/      transport, agnostic of content type
  client.ts            SDK init, env validation, region resolution
  queries.ts           findEntries / findEntryBySlug with where, ordering, pagination
  preview.ts           per-request Live Preview client, preview hosts
  image.ts             Image Delivery API url building
  image-loader.ts      custom next/image loader
  rich-text.ts         JSON RTE to HTML
  types.ts             asset, system fields, JSON RTE document

lib/content/           domain, one file per content type
  page.ts, blog-post.ts, header.ts, footer.ts, site-config.ts
  seo.ts               SEO fields to Next Metadata
  webhook.ts           webhook payload to paths and tags

components/            presentation, prop-driven and testable
  sections/            one component per modular block + the renderer
  layout/              header, footer, scripts, nav link
  blog/                card, grid, article, list
  ui/                  shadcn components

app/                   routes stay thin: params, metadata, Suspense, notFound

content-model/         content type and global field schemas as JSON
scripts/               one-off tooling, not part of the build
```

The data layer throws; routes decide what to show. `lib/result.ts` provides `attempt()` so JSX never sits inside a `try/catch`, which would only ever catch the await.

## Caching and revalidation

One profile, defined in `next.config.ts` and referenced by name everywhere:

```ts
cacheLife: { content: { stale: 60, revalidate: 60, expire: 60 * 60 } }
```

Every adapter calls `cacheLife("content")` and `cacheTag(...)`, so the window is one line to change. The values are identical in development on purpose: a shorter `revalidate` reads as dynamic to Next and stops the root layout from prerendering.

`POST /api/revalidate` receives Contentstack webhooks and purges on publish, so a change appears immediately rather than within 60 seconds.

| Published | Purges |
|---|---|
| `blog_post` | `/blog/<slug>`, `/blog`, `/` |
| `page` | the entry's `url` |
| `site_config`, `header`, `footer` | `/` plus every shell tag |

The route verifies a `Bearer` token against `CONTENTSTACK_WEBHOOK_SECRET` with a timing-safe digest comparison, and ignores payloads whose environment does not match `CONTENTSTACK_ENVIRONMENT`. Response codes are diagnostic: **401** means the secret diverges, **500** means it is unset on the server, and `{"revalidated": false, "reason": "ignored"}` means the environment did not match.

## Live Preview

Set `CONTENTSTACK_PREVIEW_TOKEN` and point the environment's base URL at the site. Everything else is already wired: without the token `LivePreviewSlot` renders nothing and the site behaves normally.

Three details carry the whole flow, each working around a real constraint:

- **`proxy.ts`** catches any request carrying `live_preview`, redirects once through `/api/draft` to enable draft mode, then forwards the hash as request **headers**. Vercel strips search params during ISR, draft mode included, so a query string would not survive. `HEAD` passes straight through, because the panel probes the url before loading the iframe and a redirect makes it report the page unreachable.
- **`/api/draft`** re-issues the draft cookie as `SameSite=None`. Next sets it `Lax`, which the browser drops inside the panel's cross-site iframe.
- **`createPreviewClient`** builds a fresh SDK instance per request. A shared one leaks an editor's draft into other visitors' responses.

Locally the panel needs https, so use `pnpm dev:https`.

## Discovery routes

| Route | Source | Purpose |
|---|---|---|
| `/robots.txt` | `app/robots.ts` | Allows crawlers, disallows `/api/`, points at the sitemap |
| `/sitemap.xml` | `app/sitemap.ts` | Every `page` url plus `/blog` and each post, with `lastModified` |
| `/llms.txt` | `app/llms.txt/route.ts` | The [llmstxt.org](https://llmstxt.org) summary, listing pages and articles |
| `/.well-known/ai-catalog.json` | `app/api/ai-catalog/route.ts` | Agentic Resource Discovery manifest, also served at `/.well-known/ard.json` |

Two details that are easy to get wrong:

- The ARD `Agentmap:` directive is **not** in `robots.txt`, because Lighthouse reports the file as invalid when it is present. The catalog is advertised through `<link rel="ai-catalog">` in the root layout instead.
- App Router ignores folders starting with a dot, so the `.well-known` paths are rewrites to a normal route rather than files or route segments.

`entries` in the catalog is empty on purpose: the site exposes no agent-facing API, and the spec allows an empty list. Inventing entries would make the manifest a lie that validates.

## Design system

Tokens live in `app/globals.css` on top of the shadcn set.

| Token | Light | Dark |
|---|---|---|
| `background` | `#F9F9F9` | `#0B111F` |
| `foreground` | `#393C45` | `#F9F9F9` |
| `heading` | `#0B111F` | `#FFFFFF` |
| `primary` | `#3416F5` | `#D7D5FD` |

Typography: **Inter** for body, **Fraunces** for headings, **JetBrains Mono** for dates, tags and code, all registered in `lib/fonts.ts` and mapped to `--font-sans`, `--font-heading` and `--font-mono`.

`h1`–`h6` are styled in `@layer base`, so headings are consistent without per-component classes. The **`.rich-text`** class governs HTML the JSON RTE injects, which no React component can reach: lists, links, blockquote, code, tables with their own horizontal scroll, `hr`, images and captions. Tailwind's preflight strips most of that, so it has to be restored explicitly.

Images go through a custom `next/image` loader that rewrites each srcset entry into an Image Delivery API request. Contentstack resizes, the Next optimizer stays out of the path, and responsive images still work.

## Tests

```bash
pnpm test
```

179 tests across 26 files, covering pure helpers, the data layer with the SDK mocked, blog and layout components, section rendering, webhook payload resolution, and the error and empty states.

Two deliberate choices in `vitest.setup.ts`:

- **`next/image` is mocked.** Vitest never reads `next.config.ts`, so the real component would fall back to the default optimizer and assert urls production never serves. The custom loader has its own unit test instead.
- **`next/cache` is mocked**, because `cacheLife` and `cacheTag` only work inside a Next request scope.

The security boundary of the scripts field is tested directly: `safeGtmId` rejects break-out attempts because the container id is interpolated into a `<script>`, and `safeScriptSrc` rejects `javascript:`, `data:` and plain http.

## Workflow

Gitflow. Features branch off `develop` and merge back with `--no-ff`; `develop` reaches `main` at release.

A pre-commit hook runs `lint-staged` (ESLint with `--fix` on staged `.ts`/`.tsx`) and a project-wide `typecheck`. Tests are left to CI so commits stay fast. The hook is local and bypassable with `--no-verify`; the real gate is the required status check.

`.github/workflows/ci.yml` runs on pull requests and pushes to `main` and `develop`:

- **`test`** — lint, typecheck, unit tests. No network. This is the required check.
- **`build`** — a real `pnpm build` against the stack. Skips with a notice when `CONTENTSTACK_DELIVERY_TOKEN` is absent, so fork pull requests do not fail.

Commits follow Conventional Commits.

## Deployment

Vercel, with `CONTENTSTACK_*` set under Settings → Environment Variables for Production, Preview and Development. Without them the build fails while prerendering, since `generateStaticParams` reads from the Delivery API.

## Starting a new project from this template

What to change, roughly in order:

1. `package.json` `name`, this README, and `SITE_NAME_FALLBACK` in `lib/content/site-config.ts` — the one place the site name is hardcoded.
2. Tokens in `app/globals.css` and fonts in `lib/fonts.ts`. The values below are placeholders.
3. The content model. Edit `content-model/`, add the file to `PLAN` in `scripts/import-content-model.mjs`, then write the matching adapter in `lib/content/` and component in `components/sections/`. Those three steps are what adding a section costs.
4. Delete what the project does not need. The blog is four files under `components/blog/` plus `lib/content/blog-post.ts` and the two routes under `app/blog/`.

One environment per deploy target, each with its own base URL and a delivery token scoped to it. A single environment pointing at localhost works for development and nothing else.

## Known gaps

- Asset `alt` text falls back to the asset title, which Contentstack fills with the filename on upload. Fix the titles in Contentstack rather than in code.
- The header and footer render from the site default. The per-page override exists in the schema but the root layout does not read the current route, so switching to per-page resolution means moving them out of the layout.
- `content-model/` ships schemas, not entries. A fresh stack imports empty: the `site_config` singleton, a header, a footer and a home `page` still have to be created by hand.
