# Art UK Open GLAM Toolkit

A static website for the Art UK Open GLAM Toolkit, developed by Art UK in partnership with the [GLAM-E Lab](https://www.glamelab.org/).

The toolkit's content and user journeys are authored in [Twine](https://twinery.org/) (SugarCube format). This repository turns the published Twine export into a conventional multi-page site built with [Eleventy](https://www.11ty.dev/), styled with the Art UK palette, and adds a side navigation and breadcrumb trail so readers always know where they are in the process.

## Quick start

```bash
npm install
npm run serve      # imports the Twine export, builds, and serves at http://localhost:8080
npm run build      # production build to _site/
```

Node 20 or newer.

## Updating the content

Content lives in Twine. To publish a change:

1. In Twine, open the story and choose **Build → Publish to File**.
2. Save the HTML over `twine/artuk-toolkit.html` (any single `.html` file in `twine/` is picked up).
3. Commit and push. The GitHub Pages workflow rebuilds the site.

Locally, `npm run build` (or `npm run serve`) re-imports automatically.

### What the importer does

`scripts/import-twine.js` reads every `<tw-passagedata>` element and, for each page listed in `src/_data/toolkit.js`:

- converts `[[Label|Passage]]` links to site URLs and fails the build on a link to an unknown passage;
- removes the hand-written `artuk-breadcrumb` paragraphs and the `PassageHeader` sidenav, which the site regenerates;
- turns `artuk-resource-box` blocks into native `<details>` disclosures;
- promotes `btn-link`, `btn-link-outline` and `btn-link-ghost` spans to block elements;
- wraps loose text in paragraphs and adds `rel="noopener"` to external links;
- uses the passage's `<h1>` as the page title (rendered by the layout, with the breadcrumb above it).

It prints a short list of notes (placeholder content, missing headings) on every run.

### Adding or renaming a passage

Every passage that should become a page must have an entry in `src/_data/toolkit.js`: the passage name, URL, navigation label, breadcrumb parent and optional sidenav group. Passages not listed there are ignored with a note. The importer stops with an error if a listed passage is missing from the export, so a renamed passage is caught at build time.

Role pages (`role: true`) recommend modules by linking to them; the importer records those links in `src/_data/generated/roles.json`, which drives the "For you" badges.

## How the site is put together

```
twine/                      Twine export (the content source of truth)
scripts/import-twine.js     Twine → src/_data/generated/*.json
src/_data/toolkit.js        Site structure: URLs, labels, parents, order, groups
src/_data/toolkitJson.js    Small JSON blob embedded in each page for the script
src/pages.njk               One page per imported passage (Eleventy pagination)
src/_includes/layouts/      base.njk (document) and toolkit.njk (sidenav + page)
src/_includes/partials/     header, footer, sidenav, breadcrumb, inline Art UK logo
src/assets/css/toolkit.css  Styles; brand colours are CSS custom properties at the top
src/assets/js/toolkit.js    Progressive enhancement (role memory, visited ticks, mobile drawer)
```

### Navigation and breadcrumbs

- **Sidenav** groups the pages into *Start here*, *Getting to know open access* (modules 1–8) and *Next steps*, highlights the current page and ticks pages already visited.
- **Breadcrumb** shows the canonical trail from Welcome to the current page. Once a reader picks a role on *About you*, the role is inserted into the trail on every later page and shown under *About you* in the sidenav, and that role's recommended modules get a *For you* badge.
- Role and visited state live in `localStorage` only. *Reset my progress* in the footer clears them. Nothing is sent anywhere.

### Branding

Colours follow the Art UK Brand Refresh (July 2023): orange header with the maroon logo (the brand's leading combination), maroon primary actions and footer, Persian Blue links, aquamarine highlights, warm grey metadata. The Art UK logo is traced from the brand guidelines PDF and inlined as SVG so it can take any colour; replace `src/_includes/partials/artuk-logo.njk` with the official SVG when supplied.

Typography uses GLAM-E Lab's Cooper Hewitt as a placeholder. When Art UK's web fonts arrive, add the `@font-face` rules and change `--font` in `toolkit.css`.

## Deployment

The site deploys to Cloudflare (Workers with static assets) from the GitHub repository. `wrangler.jsonc` points Cloudflare at `_site/`. In the Cloudflare project the build command is `npm run build`, the deploy command is `npx wrangler deploy`, and the `NODE_VERSION` environment variable is `20`. Pushes to `main` deploy to production; pull requests get preview URLs.

The site expects to be served from the root of a (sub)domain. To serve from a sub-path instead, set `PATH_PREFIX=/toolkit/` at build time.

## Known placeholders

- *Open access with Art UK* and *Register my interest* carry copy marked by Art UK as placeholder.
- *Open organisations on Art UK* awaits a data feed of CC0/Public Domain Mark collections.
- Module 1 lists "Art UK's Digital Skills — Resource TBD".
