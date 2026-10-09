# ArtUK Open GLAM Toolkit: execution plan

Prepared 2026-10-09 from `background_materials/spec.md`, the `artuk-demo` Twine export, the `glam-e-lab-website` repo, and the ArtUK Brand Refresh (July 2023) guidelines. The XD mockups could not be opened from this environment (see Q1).

## 1. What we are starting from

### The Twine (`NYUEngelberg/artuk-demo`)
- One file, `index.html`, SugarCube 2.37.3, story "Art UK Open Access Prototype Final".
- 24 content passages plus a `PassageHeader` passage. **No macros, variables, or conditional logic anywhere.** It is a pure link graph with HTML markup inside each passage. Nothing is lost by flattening it to static pages.
- Content shape:
  - Entry: Welcome → Getting started ("Let's go!") → three branches (learn about Art UK's project / understand going open / register interest).
  - "About you" asks for a role (8 roles). Each role page recommends a subset of 8 numbered modules.
  - 8 modules (1. Understanding 'open' … 8. Making the case), each with "Next section" links, an accordion resource box, and outbound links to glamelab.org, Creative Commons, gov.uk, etc.
  - Closing pages: Open access on display, Open organisations on Art UK (placeholder), Let me register my interest (placeholder).
- Markup conventions already in use (we can map these 1:1 to components): `btn-link`, `btn-link-outline`, `btn-link-ghost`, `artuk-resource-box` (accordion), `artuk-breadcrumb`, `artuk-sidenav`.
- **The Twine already contains a hand-written breadcrumb at the top and bottom of every passage, and a sidenav in `PassageHeader`.** Both are maintained by hand per passage, and they already drift (typos such as "Open acccess", inconsistent labels, one link with an empty label in "Copyright clearance and risk"). The new site should generate these from one source of truth instead.
- The story stylesheet is a half-finished ArtUK skin: design tokens exist but most are placeholder values (e.g. `--artuk-red: #1A1A1A`), Inter is loaded as a stand-in for Graphik/Apercu.
- Script adds `?page=slug` to the URL on each passage. This is the only "routing" and it disappears with a static build.

### The GLAM-E Lab site (`NYUEngelberg/glam-e-lab-website`)
- Jekyll + Contentful + Gulp/Sass/Webpack, Foundation grid, deployed to GitHub Pages. Contentful means it cannot be built locally without credentials, and it is not a good host for a hand-authored toolkit.
- Reusable look-and-feel pieces: `_sass/_colors.scss`, `_typography.scss` (Cooper Hewitt Book/Bold, self-hosted woff), `_button.scss` (pill, uppercase), `_header.scss`/`_nav.scss` (fixed top bar, slide-out dark nav), `_footer.scss`, logos in `source/images/`. Page background `#FAFAFA`, accent purple/blue/green/orange/yellow.
- We own it, so Sass partials, fonts, and SVG logos can be copied directly.

### ArtUK brand guidelines
- Palette: Orange `#ff4b00`, Carmine `#ca002e`, Brown `#533119`, Lemon `#d7d70f`, Mustard `#a19202`, Maroon `#750019`, Aquamarine `#5affd3`, Lilac `#8080d0`, Persian Blue `#174bc4`, Warm Grey `#9b938c`. Leading combination is maroon on orange.
- Rules: WCAG AA contrast required; on coloured backgrounds text must be white or black; "do not use white or black type on compositions"; lines-as-frame compositions; co-branding uses a vertical line separator with partner logo aligned to the ArtUK wordmark.
- Typeface is Apercu (commercial). The PDF contains no font files or logo SVGs.

## 2. Recommendation: 11ty with a Twine-to-pages pipeline

Build a stand-alone Eleventy site. A small Node script reads the Twine HTML export, turns each passage into a page, and 11ty renders them with GLAM-E/ArtUK layouts. Twine stays the authoring tool.

Why this over reskinning the Twine:
- The content has zero state logic, so a static export is lossless, and a reskin would keep SugarCube's runtime, single-URL app model, and JS requirement for no benefit.
- Real URLs per page (shareable, indexable, back-button works, works without JS).
- Sidenav, breadcrumb, and prev/next come from one declared structure rather than 25 hand-edited copies.
- 11ty matches your stated preference, is plain HTML/Nunjucks (close to Jekyll's Liquid for anyone who has touched the GLAM-E site), and deploys to GitHub Pages with one Action.

Workflow after launch: edit in Twine → "Publish to file" → commit `index.html` (or a `.twee` export) → CI builds and deploys.

## 3. Phases

### Phase 0: Setup and decisions (needs answers to the questions in §4)
- Create repo, `npm init`, Eleventy 3, Sass (Dart), GitHub Pages Action, Node version pin.
- Resolve mockups, hosting URL, font and logo assets.

### Phase 1: Twine import pipeline
- `scripts/import-twine.js`: parse `<tw-passagedata>` elements → `src/_data/passages.json` (name, slug, HTML body, outgoing links).
- Rewrite `[[label|target]]` and `[[target]]` links to site URLs. Fail the build on a link to a non-existent passage.
- Strip the hand-written `artuk-breadcrumb` paragraphs and `PassageHeader` sidenav from bodies (they are regenerated).
- Normalise the existing markup: `btn-link*` spans → button components, `artuk-resource-box` → `<details>`-based accordion (no JS), add `rel="noopener"` to `target="_blank"` links.
- Emit a link-graph report so content issues (typos, empty labels, orphan pages) are visible.
- Also accept a `.twee` file as input so the diff-friendly format can be adopted later without changing anything else.

### Phase 2: 11ty site in the GLAM-E look (spec item 1)
- `src/_data/toolkit.json`: the declared site structure (ordered sections, which pages are modules 1–8, parent for breadcrumbs, which pages are "featured" in the sidenav). This mirrors what `PassageHeader` already encodes.
- Layouts: `base.njk` (head, header, footer), `toolkit.njk` (sidenav + breadcrumb + content + prev/next).
- Port GLAM-E partials: colours, typography and Cooper Hewitt fonts, buttons, header/top bar, footer, slide-out nav; replace Foundation with a small CSS grid.
- One page per passage with pretty URLs (`/modules/1-understanding-open/`, `/about-you/collections-and-curatorial/`, etc.).
- Deliverable: a site that looks like a glamelab.org section and contains the full Twine.

### Phase 3: ArtUK restyle (spec item 2)
- Introduce a token layer (`_tokens.scss` / CSS custom properties) so the GLAM-E and ArtUK themes are two value sets over the same components.
- Apply the ArtUK palette: maroon/orange as the lead pairing for header and primary actions, Persian Blue/Lilac/Aquamarine for secondary buttons and the sidenav current state, Warm Grey for metadata, warm off-white page background.
- Verify every text/background pair against WCAG AA (automated check in the build).
- Typography per Q5 (Apercu if licensed, otherwise an approved fallback).
- Co-branded header lockup (ArtUK | GLAM-E Lab) following the co-branding rules; optional line-composition hero on the Welcome page.

### Phase 4: UX features (spec item 3)
- Sidenav: always visible on desktop, collapsible drawer on mobile; shows current page, the four stages (Getting started / About you / Getting to know / Modules 1–8 / Closing), and marks visited pages via `localStorage` (progressive enhancement; works without it).
- Breadcrumb: generated from `toolkit.json` parents, with the role page inserted when the user arrived via a role (Q4 decides whether this is remembered).
- Prev/next footer generated from section order.
- Optional, pending Q4: remember the chosen role and highlight that role's recommended modules in the sidenav.

### Phase 5: QA and handoff
- Automated: link check (internal + external), pa11y/axe pass, HTML validation, Lighthouse.
- Manual: content review against the Twine; responsive check at phone/tablet/desktop.
- README covering: how to re-export from Twine, how to add a page, how to switch themes, how deploys work.

Rough effort: Phases 1–2 are the bulk (roughly 60%), Phase 3 about 20%, Phase 4 about 15%, Phase 5 the rest.

## 4. Questions to answer before implementation

Ordered by how much they block.

1. **Mockups.** The Adobe XD share link renders only as a JavaScript shell and cannot be read here. Can you export the artboards as PDF or PNGs into `background_materials/`? Specifically useful: the page template with sidenav/breadcrumb, the Welcome page, a module page, and mobile views if they exist.
2. **Hosting and URL.** Where will this live: GitHub Pages under NYUEngelberg (e.g. `toolkit.glamelab.org`), a path under glamelab.org, or an Art UK domain? This sets the base path and whether the GLAM-E header/footer should link back into glamelab.org as if it were one site.
3. **Content source of truth going forward.** Does Art UK or the Lab keep editing in Twine? If yes, is committing the published `index.html` acceptable, or would you prefer the `.twee` text export (cleaner diffs)? Who will run the export and commit?
4. **Breadcrumb semantics.** The Twine graph is not a tree: modules are reachable from any role page and from the "Getting to know" page. Options: (a) one canonical trail per page (Welcome / Getting started / About you / Getting to know / Module N), matching what the Twine authors hand-wrote; (b) remember the chosen role in the browser and show it in the trail and highlight that role's modules in the sidenav. (a) is simpler and fully static; (b) is a better "where am I" signal but needs a little JS and state. Which do you want?
5. **Typography and brand assets.** Apercu is a commercial font. Does Art UK have a web licence we can use, or should we fall back (Inter as the Twine does, or GLAM-E's Cooper Hewitt)? We also need Art UK's logo SVGs and the co-branding lockup files; the PDF contains none.
6. **How ArtUK should the site be?** Spec item 2 says "at a minimum, colours". Should the result read as an Art UK product that credits GLAM-E Lab, or a GLAM-E Lab page in Art UK colours? This affects header lockup, button shapes (GLAM-E pills vs. flat), and whether we use the line-composition device.
7. **Placeholder pages.** "Let me register my interest" and "Open organisations on Art UK" are placeholders. For launch: link out to an Art UK form or email, embed a form, or leave as placeholder? Is a data feed of CC0/PDM organisations expected?
8. **Analytics and consent.** Plausible like glamelab.org, something Art UK uses, or nothing?
9. **Accessibility target.** Assume WCAG 2.2 AA (the brand guide requires AA contrast). Confirm.
10. **Repo and licence.** New repo name under NYUEngelberg? Code licence? Content licence statement in the footer (Art UK and GLAM-E Lab content)?
11. **Framework confirmation.** Proceed with Eleventy as recommended? Node 20 LTS assumed.

## 5. Content issues noticed (for the content owners, not blockers)
- Typos: "IImproved" (Open access with Art UK), "Open acccess on display" (several role pages), "Understanding 'open and what it means" (unbalanced quote in module 1 breadcrumb).
- Empty link label `[[|Digitisation and copyright law in the UK]]` in "Copyright clearance and risk".
- Inconsistent labels for the same target ("Let's get started" vs "Let's get started!"; "Roles" vs "About you").
- "Open access with Art UK" is marked "Placeholder content to be revised by Art UK during delivery".
- Several heading levels skip (h1 → h4); the pipeline can normalise these for accessibility if you agree.
