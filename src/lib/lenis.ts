/**
 * lenis.ts — smooth momentum scroll, synced to GSAP ScrollTrigger.
 *
 * One shared Lenis instance for the whole site. ScrollTrigger is driven from
 * Lenis's RAF so pinned/scrubbed scenes stay perfectly in sync with the eased
 * scroll position. Disabled entirely under prefers-reduced-motion (native
 * scrolling, no JS overhead).
 */
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { prefersReducedMotion } from "./motion";

let lenis: Lenis | null = null;

export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;

  if (prefersReducedMotion()) {
    // Native scroll only — keep ScrollTrigger working off the window scroller.
    document.documentElement.classList.remove("lenis", "lenis-smooth");
    return null;
  }

  lenis = new Lenis({
    duration: 1.1,
    // Custom easing — slightly long, soft settle (matches --ease-out-soft).
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    lerp: 0.1,
  });

  // Drive ScrollTrigger from Lenis scroll events.
  lenis.on("scroll", ScrollTrigger.update);

  // Drive Lenis from GSAP's ticker (single RAF loop, no double rAF).
  gsap.ticker.add((time: number) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis(): Lenis | null {
  return lenis;
}

/** Smooth-scroll to a target (selector or element). Used by nav / hero hotzones. */
export function scrollTo(
  target: string | HTMLElement | number,
  opts: { offset?: number; duration?: number; immediate?: boolean } = {}
): void {
  const { offset = 0, duration = 1.2, immediate = false } = opts;

  if (!lenis) {
    // Reduced-motion / no-Lenis fallback: native jump.
    const el =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : typeof target === "number"
          ? null
          : target;
    if (el) {
      el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
    }
    return;
  }

  lenis.scrollTo(target, { offset, duration, immediate });
}

export { lenis };
