// Reads the published Twine (SugarCube) export in ./twine and writes
// src/_data/generated/passages.json, one entry per page defined in
// src/_data/toolkit.js, with Twine link syntax converted to site URLs and
// the passage markup tidied into real paragraphs.
//
// Usage: node scripts/import-twine.js [path/to/twine-export.html]

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";
import toolkit from "../src/_data/toolkit.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const twineDir = resolve(root, "twine");
const outDir = resolve(root, "src/_data/generated");

const inputPath =
  process.argv[2] ??
  resolve(
    twineDir,
    readdirSync(twineDir).find((f) => f.endsWith(".html")) ?? "artuk-toolkit.html",
  );

const issues = [];
const warn = (where, msg) => issues.push(`${where}: ${msg}`);

// ---------------------------------------------------------------------------
// 1. Pull passages out of the export.
// ---------------------------------------------------------------------------
const html = readFileSync(inputPath, "utf8");
const storyData = parse(html).querySelector("tw-storydata");
if (!storyData) throw new Error(`No <tw-storydata> found in ${inputPath}`);

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const passages = new Map();
for (const el of storyData.querySelectorAll("tw-passagedata")) {
  const name = decode(el.getAttribute("name"));
  passages.set(name, decode(el.innerHTML));
}

// Passages that are SugarCube special passages, not content.
const SPECIAL = new Set(["PassageHeader", "PassageFooter", "StoryInit", "StoryCaption"]);

for (const name of passages.keys()) {
  if (!SPECIAL.has(name) && !toolkit.byPassage[name]) {
    warn(name, "passage exists in Twine but is not mapped in src/_data/toolkit.js");
  }
}
for (const page of toolkit.pages) {
  if (!passages.has(page.passage)) {
    throw new Error(`Page "${page.slug}" expects passage "${page.passage}" but it is not in the Twine export`);
  }
}

// ---------------------------------------------------------------------------
// 2. Transform one passage body into page HTML.
// ---------------------------------------------------------------------------
const BLOCK = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "div", "details",
  "blockquote", "table", "figure", "iframe", "hr", "nav", "section",
]);

function convertLinks(src, where) {
  const links = new Set();
  const out = src.replace(/\[\[(.*?)\]\]/g, (_, inner) => {
    let label, target;
    if (inner.includes("|")) {
      [label, target] = inner.split("|").map((s) => s.trim());
    } else if (inner.includes("->")) {
      [label, target] = inner.split("->").map((s) => s.trim());
    } else {
      label = target = inner.trim();
    }
    const page = toolkit.byPassage[target];
    if (!page) {
      throw new Error(`${where}: link to unknown passage "${target}"`);
    }
    if (!label) {
      warn(where, `empty link label for "${target}", using page label`);
      label = page.label;
    }
    links.add(page.slug);
    return `<a href="${page.url}" data-page="${page.slug}">${label}</a>`;
  });
  return { html: out, links: [...links] };
}

function tidyExternalLinks(rootNode) {
  for (const a of rootNode.querySelectorAll("a[target]")) {
    const t = a.getAttribute("target");
    if (t === "blank" || t === "_blank") {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    }
  }
}

// Turn runs of inline content separated by blank lines into <p> elements.
// Operates on the direct children of `container`.
function paragraphize(container) {
  const pieces = [];
  let run = [];

  const flush = () => {
    if (!run.length) return;
    const raw = run.map((n) => n.toString()).join("");
    run = [];
    for (const chunk of raw.split(/\n[ \t]*\n/)) {
      const text = chunk.trim();
      if (!text) continue;
      pieces.push(`<p>${text.replace(/\n/g, "<br>\n")}</p>`);
    }
  };

  const queue = [...container.childNodes];
  while (queue.length) {
    const node = queue.shift();
    const tag = node.rawTagName?.toLowerCase();
    const isButtonSpan =
      tag === "span" && /\bbtn-link/.test(node.getAttribute("class") ?? "");
    if (tag === "p" && node.querySelector("ul, ol, div, h1, h2, h3, h4")) {
      // Twine authors sometimes wrap lists in <p>; unwrap and keep going.
      queue.unshift(...node.childNodes);
      continue;
    }
    if (tag && (BLOCK.has(tag) || isButtonSpan)) {
      flush();
      if (isButtonSpan) {
        // Promote button wrappers to block-level elements.
        node.rawTagName = "p";
      }
      if (tag === "p") {
        // Keep well-formed paragraphs; normalise line breaks inside them.
        const inner = node.innerHTML.trim().replace(/\n[ \t]*\n/g, "</p><p>").replace(/\n/g, "<br>\n");
        node.set_content(inner);
      }
      pieces.push(node.toString());
    } else {
      run.push(node);
    }
  }
  flush();
  return pieces.join("\n");
}

function transform(page) {
  const where = `"${page.passage}"`;
  let src = passages.get(page.passage);

  // Hand-written breadcrumbs and prev/next lines are regenerated by the site.
  src = src.replace(/<p class="artuk-breadcrumb">[\s\S]*?<\/p>/g, "");

  // Resource boxes become native disclosure widgets.
  src = src.replace(
    /<div class="artuk-resource-box">\s*<h4>([\s\S]*?)<\/h4>([\s\S]*?)<\/div>/g,
    (_, heading, body) =>
      `<details class="resource-box"><summary>${heading.trim()}</summary><div class="resource-box__body">${body}</div></details>`,
  );

  const { html: linked, links } = convertLinks(src, where);
  const node = parse(linked, { blockTextElements: { script: true, style: true } });

  // Title: first <h1>, removed from the body and rendered by the layout.
  let title = page.label;
  const h1 = node.querySelector("h1");
  if (h1) {
    title = h1.textContent.replace(/\s+/g, " ").trim();
    h1.remove();
  } else {
    warn(where, "no <h1>; using nav label as the page title");
  }

  tidyExternalLinks(node);

  // Paragraphize the root and the inside of each resource box.
  for (const box of node.querySelectorAll(".resource-box__body")) {
    box.set_content(paragraphize(box));
  }
  let body = paragraphize(node);

  // Twine authors write ">>" as an arrow before the resource title in
  // outline buttons. Turn it into a real arrow and put the title on its own line.
  body = body.replace(/&gt;&gt;|>>/g, "→");
  body = body.replace(
    /(<p class="btn-link-outline">[\s\S]*?)→\s*([\s\S]*?)\s*(<\/a>)/g,
    '$1<span class="btn-link-outline__title">$2</span>$3',
  );

  // Placeholder notes written in the Twine.
  if (/Placeholder content/i.test(body)) {
    warn(where, "contains placeholder content marked for revision by Art UK");
  }

  return { ...page, title, body, links };
}

// ---------------------------------------------------------------------------
// 3. Write output.
// ---------------------------------------------------------------------------
const out = toolkit.pages.map(transform);

// Which modules each role page recommends (derived from its links).
const moduleSlugs = new Set(toolkit.modules.map((m) => m.slug));
const roles = {};
for (const p of out) {
  if (p.role) roles[p.slug] = p.links.filter((s) => moduleSlugs.has(s));
}

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "passages.json"), JSON.stringify(out, null, 2));
writeFileSync(resolve(outDir, "roles.json"), JSON.stringify(roles, null, 2));

console.log(`Imported ${out.length} pages from ${inputPath}`);
for (const line of issues) console.log(`  note: ${line}`);
