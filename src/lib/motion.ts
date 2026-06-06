/**
 * motion.ts — single source of truth for the prefers-reduced-motion decision.
 *
 * Every interactive module (lenis, gsap scenes, cursor, grain) checks here
 * before doing anything expensive. The CSS @media guard in global.css handles
 * declarative transitions; this handles imperative JS.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

/** True when the user has asked the OS to minimize motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/** Convenience inverse — "is rich motion allowed right now". */
export function motionAllowed(): boolean {
  return !prefersReducedMotion();
}

/**
 * Subscribe to live changes (user toggles the OS setting without reload).
 * Returns an unsubscribe fn.
 */
export function onReducedMotionChange(
  cb: (reduced: boolean) => void
): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}

/** Coarse-pointer / touch detection — used to skip custom cursor + hover-only FX. */
export function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}
