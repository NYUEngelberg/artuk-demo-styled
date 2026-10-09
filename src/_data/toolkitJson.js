// Small JSON blob embedded in every page for the progressive-enhancement
// script: role → recommended modules, and slug → {label, url} for the pages
// that the breadcrumb and sidenav need to reference at runtime.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import toolkit from "./toolkit.js";

export default function () {
  const roles = JSON.parse(
    readFileSync(resolve("src/_data/generated/roles.json"), "utf8"),
  );
  const pages = Object.fromEntries(
    toolkit.pages.map((p) => [p.slug, { label: p.label, url: p.url, role: !!p.role }]),
  );
  return JSON.stringify({ roles, pages });
}
