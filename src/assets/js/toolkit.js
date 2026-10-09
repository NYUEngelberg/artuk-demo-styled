// Progressive enhancement for the Art UK Open GLAM Toolkit.
// Everything here is optional: the site is fully usable without it.
//
//  - remembers which pages the reader has visited (sidenav ticks)
//  - remembers the role they chose on "About you" and reflects it in the
//    breadcrumb trail and the sidenav ("For you" badges on recommended modules)
//  - toggles the sidenav drawer on small screens
(function () {
  "use strict";

  var dataEl = document.getElementById("toolkit-data");
  var data = dataEl ? JSON.parse(dataEl.textContent) : { roles: {}, pages: {} };
  var body = document.body;
  var slug = body.getAttribute("data-page");
  var root = body.getAttribute("data-root") || "/";

  var KEY = "artuk-toolkit:";
  var store = {
    get: function (k) {
      try { return JSON.parse(localStorage.getItem(KEY + k)); } catch (e) { return null; }
    },
    set: function (k, v) {
      try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* ignore */ }
    },
    clear: function () {
      try {
        Object.keys(localStorage)
          .filter(function (k) { return k.indexOf(KEY) === 0; })
          .forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) { /* ignore */ }
    },
  };

  function href(url) {
    return (root.replace(/\/$/, "") + url) || "/";
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  // ---- Visited pages ------------------------------------------------------
  var visited = store.get("visited") || [];
  if (slug && visited.indexOf(slug) < 0) visited.push(slug);
  store.set("visited", visited);

  $$(".sidenav__item").forEach(function (li) {
    var s = li.getAttribute("data-nav");
    if (s !== slug && visited.indexOf(s) >= 0) {
      li.classList.add("is-visited");
      var check = $(".sidenav__check", li);
      if (check) check.hidden = false;
    }
  });

  // ---- Role -----------------------------------------------------------------
  var roleOnPage = body.getAttribute("data-role");
  if (roleOnPage) store.set("role", roleOnPage);
  var role = store.get("role");

  if (role && data.pages[role]) {
    var rolePage = data.pages[role];
    var recommended = data.roles[role] || [];

    recommended.forEach(function (s) {
      var li = $('.sidenav__item[data-nav="' + s + '"]');
      if (!li) return;
      li.classList.add("is-recommended");
      var badge = $(".sidenav__badge", li);
      if (badge) badge.hidden = false;
    });

    var slot = $("[data-role-slot]");
    if (slot) {
      slot.hidden = false;
      var link = $("[data-role-link]", slot);
      link.textContent = rolePage.label;
      link.href = href(rolePage.url);
      if (role === slug) slot.classList.add("is-current");
    }

    // Insert the role into the breadcrumb after "About you" on any page that
    // sits below it in the journey (modules, getting to know, next steps).
    var aboutCrumb = $('.breadcrumb__item[data-crumb="about-you"]');
    var currentIsRole = data.pages[slug] && data.pages[slug].role;
    if (aboutCrumb && slug !== "about-you" && !currentIsRole) {
      var li = document.createElement("li");
      li.className = "breadcrumb__item breadcrumb__item--role";
      li.setAttribute("data-crumb", role);
      var a = document.createElement("a");
      a.href = href(rolePage.url);
      a.textContent = rolePage.label;
      li.appendChild(a);
      aboutCrumb.insertAdjacentElement("afterend", li);
    }
  }

  // ---- Mobile nav drawer -------------------------------------------------
  var backdrop = $(".sidenav-backdrop");
  var menuButton = $(".site-header__menu");
  function setNav(open) {
    body.classList.toggle("nav-open", open);
    if (backdrop) backdrop.hidden = !open;
    if (menuButton) menuButton.setAttribute("aria-expanded", String(open));
  }
  $$("[data-nav-toggle]").forEach(function (el) {
    el.addEventListener("click", function () {
      setNav(!body.classList.contains("nav-open"));
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && body.classList.contains("nav-open")) setNav(false);
  });

  // ---- Reset ------------------------------------------------------------------
  $$("[data-reset-progress]").forEach(function (el) {
    el.addEventListener("click", function () {
      store.clear();
      location.reload();
    });
  });
})();
