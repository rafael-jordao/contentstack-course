# Contentstack Course

A Next.js site driven by Contentstack: generic pages composed from reusable sections, a blog, and a header, footer and third-party scripts that editors configure without a deploy.

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
pnpm dev
```

Create `.env.local` first, or the app throws on the first request: the delivery client validates its configuration at module load.

```bash
CONTENTSTACK_API_KEY=blt...              # Settings > Tokens > Stack API Key
CONTENTSTACK_DELIVERY_TOKEN=cs...        # Settings > Tokens > Delivery Token
CONTENTSTACK_ENVIRONMENT=development     # must match a Contentstack environment
CONTENTSTACK_REGION=EU                   # NA | EU | AU | AZURE_NA | AZURE_EU | GCP_NA | GCP_EU
CONTENTSTACK_WEBHOOK_SECRET=...          # shared with the Contentstack webhook
```

`CONTENTSTACK_REGION` is required on purpose. The SDK defaults to the US data center, so an unset region silently points a non-US stack at the wrong host.

None of these carry the `NEXT_PUBLIC_` prefix: every read happens on the server. Live Preview would need public copies of the API key and a preview token, which is not set up yet.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build, prerenders every known route |
| `pnpm typecheck` | `next typegen && tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest, single run |
| `pnpm test:watch` | Vitest, watch mode |

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
├── title                        ├── blog_post_title     ├── meta_title
├── url          "/" , "/about"  ├── slug                ├── meta_description
├── seo ─────────────────────────┤ cover_image           ├── og_image
├── header  (optional override)  ├── published_date      └── no_index
├── footer  (optional override)  ├── body (JSON RTE)
└── sections[] (modular blocks)  ├── blog_tags[]
    ├── hero                     └── seo ────────────────────────┘
    ├── rich_text
    ├── feature_grid
    └── post_list → blog_post
```

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

160 tests across 23 files, covering pure helpers, the data layer with the SDK mocked, blog and layout components, section rendering, webhook payload resolution, and the error and empty states.

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

## Known gaps

- Asset `alt` text falls back to the asset title, which Contentstack fills with the filename on upload. Fix the titles in Contentstack rather than in code.
- No `.env.example`.
- No preview token, so Live Preview and Visual Builder are not wired up.
- A single Contentstack environment (`development`) whose base URL points at localhost. Production needs its own environment and a delivery token scoped to it.
- The header and footer render from the site default. The per-page override exists in the schema but the root layout does not read the current route, so switching to per-page resolution means moving them out of the layout.
