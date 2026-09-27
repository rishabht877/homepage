// main.js
// Shared behavior across all pages: the mobile navigation toggle and the
// current year in the footer.

// Toggle the mobile navigation menu open and closed.
function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("nav-links-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Fill in the current year wherever a .footer-year element appears.
function initFooterYear() {
  const yearEls = document.querySelectorAll(".footer-year");
  const year = new Date().getFullYear();
  yearEls.forEach((el) => {
    el.textContent = String(year);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initFooterYear();
});
