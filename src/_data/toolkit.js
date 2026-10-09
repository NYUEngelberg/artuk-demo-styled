// Site structure for the Art UK Open GLAM Toolkit.
//
// This is the single source of truth for URLs, navigation labels, breadcrumb
// parents and previous/next order. The Twine export supplies the page content;
// this file says where each passage lives and how the pages relate.
//
// `passage` must match the passage name in the Twine export exactly.

const pages = [
  // ---- Start -------------------------------------------------------------
  {
    slug: "welcome",
    passage: "Welcome",
    label: "Welcome",
    url: "/",
    parent: null,
    group: "start",
  },
  {
    slug: "getting-started",
    passage: "Let's go!",
    label: "Getting started",
    url: "/getting-started/",
    parent: "welcome",
    group: "start",
  },
  {
    slug: "about-you",
    passage: "I want to understand what it means to go open as an organisation",
    label: "About you",
    url: "/about-you/",
    parent: "getting-started",
    group: "start",
  },

  // ---- Roles (children of About you) ------------------------------------
  {
    slug: "collections-and-curatorial",
    passage: "Collections and curatorial",
    label: "Collections and curatorial",
    url: "/about-you/collections-and-curatorial/",
    parent: "about-you",
    role: true,
  },
  {
    slug: "digital-or-tech",
    passage: "Digital or Tech",
    label: "Digital or tech",
    url: "/about-you/digital-or-tech/",
    parent: "about-you",
    role: true,
  },
  {
    slug: "commercial-and-income-generation",
    passage: "Commercial and income generation",
    label: "Commercial and income generation",
    url: "/about-you/commercial-and-income-generation/",
    parent: "about-you",
    role: true,
  },
  {
    slug: "rights-management-and-licensing",
    passage: "Rights management and licensing",
    label: "Rights management and licensing",
    url: "/about-you/rights-management-and-licensing/",
    parent: "about-you",
    role: true,
  },
  {
    slug: "audience-engagement-or-education",
    passage: "Audience engagement or educational programming",
    label: "Audience engagement or education",
    url: "/about-you/audience-engagement-or-education/",
    parent: "about-you",
    role: true,
  },
  {
    slug: "leadership-management-or-trustee",
    passage: "Leadership, management or trustee",
    label: "Leadership, management or trustee",
    url: "/about-you/leadership-management-or-trustee/",
    parent: "about-you",
    role: true,
  },
  {
    slug: "a-bit-of-everything",
    passage: "A bit of everything",
    label: "A bit of everything",
    url: "/about-you/a-bit-of-everything/",
    parent: "about-you",
    role: true,
  },
  {
    slug: "volunteer-intern-or-external-support",
    passage: "Volunteer, intern or other external support",
    label: "Volunteer, intern or external support",
    url: "/about-you/volunteer-intern-or-external-support/",
    parent: "about-you",
    role: true,
  },

  // ---- Getting to know open access (modules) ----------------------------
  {
    slug: "getting-to-know-open-access",
    passage: "Getting to know open access",
    label: "Getting to know open access",
    url: "/getting-to-know-open-access/",
    parent: "about-you",
    group: "modules",
  },
  {
    slug: "understanding-open",
    passage: "Understanding ‘open’ and what it means",
    label: "Understanding ‘open’ and what it means",
    url: "/modules/1-understanding-open/",
    parent: "getting-to-know-open-access",
    group: "modules",
    module: 1,
  },
  {
    slug: "copyright-clearance-and-risk",
    passage: "Copyright clearance and risk",
    label: "Copyright clearance and risk",
    url: "/modules/2-copyright-clearance-and-risk/",
    parent: "getting-to-know-open-access",
    group: "modules",
    module: 2,
  },
  {
    slug: "digitisation-and-copyright-law",
    passage: "Digitisation and copyright law in the UK",
    label: "Digitisation and copyright law in the UK",
    url: "/modules/3-digitisation-and-copyright-law/",
    parent: "getting-to-know-open-access",
    group: "modules",
    module: 3,
  },
  {
    slug: "creative-commons-licences-and-tools",
    passage: "Creative Commons licences and tools",
    label: "Creative Commons licences and tools",
    url: "/modules/4-creative-commons-licences-and-tools/",
    parent: "getting-to-know-open-access",
    group: "modules",
    module: 4,
  },
  {
    slug: "commercialisation-and-open-innovation",
    passage: "Commercialisation and open innovation",
    label: "Commercialisation and open innovation",
    url: "/modules/5-commercialisation-and-open-innovation/",
    parent: "getting-to-know-open-access",
    group: "modules",
    module: 5,
  },
  {
    slug: "costs-and-resources",
    passage: "Costs and other resources involved",
    label: "Costs and other resources involved",
    url: "/modules/6-costs-and-resources/",
    parent: "getting-to-know-open-access",
    group: "modules",
    module: 6,
  },
  {
    slug: "stewardship-and-reuse",
    passage: "Stewardship and reuse",
    label: "Stewardship and reuse",
    url: "/modules/7-stewardship-and-reuse/",
    parent: "getting-to-know-open-access",
    group: "modules",
    module: 7,
  },
  {
    slug: "making-the-case-for-open-access",
    passage: "Making the case for open access",
    label: "Making the case for open access",
    url: "/modules/8-making-the-case-for-open-access/",
    parent: "getting-to-know-open-access",
    group: "modules",
    module: 8,
  },

  // ---- Next steps --------------------------------------------------------
  {
    slug: "open-access-on-display",
    passage: "open access on display",
    label: "Open access on display",
    url: "/open-access-on-display/",
    parent: "getting-to-know-open-access",
    group: "next",
  },
  {
    slug: "open-access-with-art-uk",
    passage: "I want to learn more about Art UK’s open access project",
    label: "Open access with Art UK",
    url: "/open-access-with-art-uk/",
    parent: "getting-started",
    group: "next",
    prev: "getting-started",
    next: "about-you",
  },
  {
    slug: "register-interest",
    passage: "Let me register my interest",
    label: "Register my interest",
    url: "/register-interest/",
    parent: "open-access-on-display",
    group: "next",
  },
  {
    slug: "open-organisations",
    passage: "all the organisations",
    label: "Open organisations on Art UK",
    url: "/open-organisations/",
    parent: "welcome",
    prev: "welcome",
    next: "open-access-on-display",
  },
];

// The main reading order. Pages not listed here declare their own prev/next.
// Role pages are handled below: previous is About you, next is Getting to know.
const journey = [
  "welcome",
  "getting-started",
  "about-you",
  "getting-to-know-open-access",
  "understanding-open",
  "copyright-clearance-and-risk",
  "digitisation-and-copyright-law",
  "creative-commons-licences-and-tools",
  "commercialisation-and-open-innovation",
  "costs-and-resources",
  "stewardship-and-reuse",
  "making-the-case-for-open-access",
  "open-access-on-display",
  "register-interest",
];

// Sidenav groups, in display order.
const groups = [
  { id: "start", label: "Start here" },
  { id: "modules", label: "The toolkit" },
  { id: "next", label: "Next steps" },
];

const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
const byPassage = Object.fromEntries(pages.map((p) => [p.passage, p]));

for (const p of pages) {
  const i = journey.indexOf(p.slug);
  if (p.role) {
    p.prev ??= "about-you";
    p.next ??= "getting-to-know-open-access";
  } else if (i >= 0) {
    p.prev ??= journey[i - 1] ?? null;
    p.next ??= journey[i + 1] ?? null;
  }
  // Breadcrumb trail: list of slugs from the root down to this page.
  const trail = [];
  for (let cur = p; cur; cur = cur.parent ? bySlug[cur.parent] : null) {
    trail.unshift(cur.slug);
  }
  p.trail = trail;
}

export default {
  title: "Art UK Open GLAM Toolkit",
  pages,
  journey,
  groups,
  bySlug,
  byPassage,
  roles: pages.filter((p) => p.role),
  modules: pages.filter((p) => p.module).sort((a, b) => a.module - b.module),
};
