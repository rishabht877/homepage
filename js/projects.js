// projects.js
// Renders the projects gallery and drives its controls: multi-select
// technology filters, sorting, a shareable URL that reflects the current
// view, and a detail dialog per project.
//
// Everything is built with the plain DOM API and native elements
// (<button>, <select>, <dialog>) - no component library involved.

import { projects } from "./data.js";
import { createDiagram } from "./diagram.js";

// The current view. Kept in one object so the URL and the DOM stay in step.
const state = {
  tags: new Set(),
  sort: "featured",
};

// ---------------------------------------------------------------------------
// Matching and ordering
// ---------------------------------------------------------------------------

// A project is shown when it carries every selected tag.
function matches(project) {
  return Array.from(state.tags).every((tag) => project.tags.includes(tag));
}

// Sort comparators, keyed by the value of the sort <select>.
const COMPARATORS = {
  featured: (a, b) => a.featured - b.featured,
  name: (a, b) => a.name.localeCompare(b.name),
  newest: (a, b) => b.year - a.year || a.featured - b.featured,
};

function visibleProjects() {
  return projects.filter(matches).sort(COMPARATORS[state.sort] ?? COMPARATORS.featured);
}

// ---------------------------------------------------------------------------
// URL state, so a filtered view can be linked to and survives a reload
// ---------------------------------------------------------------------------

function writeStateToUrl() {
  const params = new URLSearchParams();
  if (state.tags.size > 0) {
    params.set("tags", Array.from(state.tags).join(","));
  }
  if (state.sort !== "featured") {
    params.set("sort", state.sort);
  }
  const query = params.toString();
  const url = query === "" ? window.location.pathname : `${window.location.pathname}?${query}`;
  window.history.replaceState(null, "", url);
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const sortParam = params.get("sort");
state.sort =
  sortParam && COMPARATORS[sortParam] ? sortParam : "featured";

  const tags = params.get("tags");
  if (tags) {
    const known = new Set(projects.flatMap((project) => project.tags));
    tags
      .split(",")
      .filter((tag) => known.has(tag))
      .forEach((tag) => state.tags.add(tag));
  }
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function createCard(project, index) {
  const card = el("article", "gallery-card");
  card.style.setProperty("--card-accent", project.accent);
  // Staggered reveal: each card animates in slightly after the one before it.
  card.style.setProperty("--card-delay", `${index * 70}ms`);

  const thumb = el("div", "gallery-thumb");
  thumb.appendChild(createDiagram(project, "card"));
  card.appendChild(thumb);

  const body = el("div", "gallery-card-body");

  const head = el("div", "gallery-card-head");
  head.appendChild(el("h2", "gallery-card-title", project.name));
  head.appendChild(el("span", "gallery-card-year", String(project.year)));
  body.appendChild(head);

  body.appendChild(el("p", "gallery-card-tagline", project.tagline));
  body.appendChild(el("p", "gallery-card-desc", project.summary));

  const tagList = el("ul", "gallery-tags");
  project.tags.forEach((tag) => {
    const item = el("li", "gallery-tag", tag);
    if (state.tags.has(tag)) {
      item.classList.add("gallery-tag-on");
    }
    tagList.appendChild(item);
  });
  body.appendChild(tagList);

  const actions = el("div", "gallery-card-actions");

  const detailBtn = el("button", "btn btn-solid gallery-detail-btn", "Architecture");
  detailBtn.type = "button";
  detailBtn.addEventListener("click", () => openDialog(project));
  actions.appendChild(detailBtn);

  const link = el("a", "btn btn-ghost gallery-card-link", "View on GitHub");
  link.href = project.url;
  link.target = "_blank";
  link.rel = "noopener";
  actions.appendChild(link);

  body.appendChild(actions);
  card.appendChild(body);
  return card;
}

// Reveal cards as they scroll into view, unless the visitor prefers less motion.
function observeCards(cards) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cards.forEach((card) => card.classList.add("gallery-card-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("gallery-card-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -40px 0px", threshold: 0.1 }
  );

  cards.forEach((card) => observer.observe(card));
}

// ---------------------------------------------------------------------------
// Detail dialog
// ---------------------------------------------------------------------------

function openDialog(project) {
  const dialog = document.querySelector(".project-dialog");
  if (!dialog) {
    return;
  }

  dialog.style.setProperty("--card-accent", project.accent);

  dialog.querySelector(".project-dialog-title").textContent = project.name;
  dialog.querySelector(".project-dialog-tagline").textContent = project.tagline;
  dialog.querySelector(".project-dialog-org").textContent = `${project.org} · ${project.year}`;

  const figure = dialog.querySelector(".project-dialog-figure");
  figure.textContent = "";
  figure.appendChild(createDiagram(project, "detail"));

  dialog.querySelector(".project-dialog-summary").textContent = project.detail;

  const metrics = dialog.querySelector(".project-dialog-metrics");
  metrics.textContent = "";
  project.metrics.forEach((metric) => {
    const item = el("div", "project-metric");
    item.appendChild(el("span", "project-metric-value", metric.value));
    item.appendChild(el("span", "project-metric-label", metric.label));
    metrics.appendChild(item);
  });

  const list = dialog.querySelector(".project-dialog-highlights");
  list.textContent = "";
  project.highlights.forEach((point) => {
    list.appendChild(el("li", "project-highlight", point));
  });

  const tagList = dialog.querySelector(".project-dialog-tags");
  tagList.textContent = "";
  project.tags.forEach((tag) => {
    tagList.appendChild(el("li", "gallery-tag", tag));
  });

  const link = dialog.querySelector(".project-dialog-link");
  link.href = project.url;

  dialog.showModal();
}

function initDialog() {
  const dialog = document.querySelector(".project-dialog");
  if (!dialog) {
    return;
  }

  dialog.querySelector(".project-dialog-close").addEventListener("click", () => dialog.close());

  // Clicking the backdrop (outside the inner panel) closes the dialog.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

// Every tag across all projects, with how many projects use it.
function tagCounts() {
  const counts = new Map();
  projects.forEach((project) => {
    project.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });
  return new Map(Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0])));
}

function renderFilters() {
  const bar = document.querySelector(".filter-bar");
  if (!bar) {
    return;
  }
  bar.textContent = "";

  tagCounts().forEach((count, tag) => {
    const button = el("button", "filter-btn");
    button.type = "button";
    button.appendChild(el("span", "filter-btn-text", tag));
    button.appendChild(el("span", "filter-btn-count", String(count)));

    const on = state.tags.has(tag);
    button.classList.toggle("filter-btn-active", on);
    button.setAttribute("aria-pressed", String(on));

    button.addEventListener("click", () => {
      if (state.tags.has(tag)) {
        state.tags.delete(tag);
      } else {
        state.tags.add(tag);
      }
      update();
    });

    bar.appendChild(button);
  });
}

function renderCards() {
  const grid = document.querySelector(".gallery-grid");
  const empty = document.querySelector(".gallery-empty");
  if (!grid) {
    return 0;
  }

  const shown = visibleProjects();
  grid.textContent = "";

  const cards = shown.map((project, index) => {
    const card = createCard(project, index);
    grid.appendChild(card);
    return card;
  });

  observeCards(cards);

  if (empty) {
    empty.hidden = shown.length > 0;
  }
  return shown.length;
}

function renderStatus(count) {
  const status = document.querySelector(".gallery-count");
  if (status) {
    // The noun agrees with the total, not the filtered count: "1 of 4 projects".
    const noun = projects.length === 1 ? "project" : "projects";
    status.textContent = `Showing ${count} of ${projects.length} ${noun}`;
  }

  const clear = document.querySelector(".filter-clear");
  if (clear) {
    clear.hidden = state.tags.size === 0 && state.sort === "featured";
  }
}

// Re-render everything that depends on state, then sync the URL.
function update() {
  renderFilters();
  const count = renderCards();
  renderStatus(count);
  writeStateToUrl();
}

function initControls() {
  const sort = document.querySelector(".gallery-sort");
  if (sort) {
    sort.value = state.sort;
    sort.addEventListener("change", () => {
      state.sort = sort.value;
      update();
    });
  }

  const clear = document.querySelector(".filter-clear");
  if (clear) {
    clear.addEventListener("click", () => {
      state.tags.clear();
      state.sort = "featured";
      if (sort) {
        sort.value = "featured";
      }
      update();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  readStateFromUrl();
  initDialog();
  initControls();
  update();
});
