/**
 * boot.ts — single entry point that wires the global shell.
 *
 * Order matters: gsap (register) -> lenis (drives ScrollTrigger) -> cursor +
 * grain (decorative). Each module self-guards for reduced motion / coarse
 * pointer, so this stays declarative. Imported once from BaseLayout.
 */
import { initGsap } from "./gsap";
import { destroyLenis, initLenis, refreshScrollMetrics, scrollTo } from "./lenis";
import { initCursor } from "./cursor";
import { initGrain } from "./grain";
import { isCoarsePointer, onReducedMotionChange } from "./motion";

let booted = false;

function bindInPageAnchors() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest<HTMLAnchorElement>("a[href^='#']");
    if (!anchor) return;
    if (anchor.dataset.skipSmoothScroll === "true") return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#" || !document.querySelector(href)) return;
    event.preventDefault();
    scrollTo(href);
    history.pushState(null, "", href);
  });
}

export function boot() {
  if (booted || typeof window === "undefined") return;
  booted = true;

  initGsap();
  initLenis();
  initCursor();
  initGrain();
  bindInPageAnchors();

  // Recompute triggers after fonts/images settle to avoid pin offset drift.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => refreshScrollMetrics());
  }
  window.addEventListener("load", () => refreshScrollMetrics());

  // Recreate Lenis if the OS motion preference flips mid-session.
  onReducedMotionChange((reduced) => {
    destroyLenis();
    if (!reduced && !isCoarsePointer()) {
      document.documentElement.classList.add("lenis", "lenis-smooth");
      initLenis();
    }
    refreshScrollMetrics();
  });
}

// Auto-boot when imported as a module script.
boot();
