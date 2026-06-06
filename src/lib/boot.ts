/**
 * boot.ts — single entry point that wires the global shell.
 *
 * Order matters: gsap (register) -> lenis (drives ScrollTrigger) -> cursor +
 * grain (decorative). Each module self-guards for reduced motion / coarse
 * pointer, so this stays declarative. Imported once from BaseLayout.
 */
import { initGsap, ScrollTrigger } from "./gsap";
import { initLenis } from "./lenis";
import { initCursor } from "./cursor";
import { initGrain } from "./grain";

let booted = false;

export function boot() {
  if (booted || typeof window === "undefined") return;
  booted = true;

  initGsap();
  initLenis();
  initCursor();
  initGrain();

  // Recompute triggers after fonts/images settle to avoid pin offset drift.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

// Auto-boot when imported as a module script.
boot();
