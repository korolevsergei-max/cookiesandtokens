/**
 * lenis.ts — smooth momentum scroll on fine-pointer desktops, synced to GSAP
 * ScrollTrigger. Touch / coarse-pointer devices keep native scrolling. Disabled
 * entirely under prefers-reduced-motion.
 */
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { isCoarsePointer, prefersReducedMotion } from "./motion";

let lenis: Lenis | null = null;
let tickerAttached = false;

const NAV_OFFSET_FALLBACK = -72;

function readScrollOffset(): number {
  if (typeof window === "undefined") return NAV_OFFSET_FALLBACK;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--scroll-offset")
    .trim();
  const parsed = Number.parseFloat(raw);
  if (Number.isFinite(parsed) && parsed > 0) return -parsed;
  return NAV_OFFSET_FALLBACK;
}

export function getScrollOffset(): number {
  return readScrollOffset();
}

export function shouldUseLenis(): boolean {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;
  if (isCoarsePointer()) return false;
  return true;
}

export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;

  document.documentElement.style.setProperty(
    "--nav-height",
    "4.5rem"
  );

  if (!shouldUseLenis()) {
    document.documentElement.classList.remove("lenis", "lenis-smooth");
    handleInitialHash();
    return null;
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    lerp: 0.1,
  });

  lenis.on("scroll", ScrollTrigger.update);

  if (!tickerAttached) {
    gsap.ticker.add((time: number) => {
      lenis?.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    tickerAttached = true;
  }

  handleInitialHash();
  return lenis;
}

export function destroyLenis(): void {
  if (!lenis) return;
  lenis.destroy();
  lenis = null;
  document.documentElement.classList.remove("lenis", "lenis-smooth");
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function refreshScrollMetrics(): void {
  lenis?.resize();
  ScrollTrigger.refresh();
}

function resolveElement(
  target: string | HTMLElement | number
): HTMLElement | null {
  if (typeof target === "number") return null;
  if (typeof target !== "string") return target;
  return document.querySelector<HTMLElement>(target);
}

function nativeScrollTo(
  target: string | HTMLElement | number,
  immediate = false
): void {
  if (typeof target === "number") {
    window.scrollTo({
      top: target,
      behavior: immediate ? "auto" : "smooth",
    });
    return;
  }

  const el = resolveElement(target);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + readScrollOffset();
  window.scrollTo({
    top,
    behavior: immediate ? "auto" : "smooth",
  });
}

/** Smooth-scroll to a target (selector, element, or absolute Y). */
export function scrollTo(
  target: string | HTMLElement | number,
  opts: { offset?: number; duration?: number; immediate?: boolean } = {}
): void {
  const {
    offset = readScrollOffset(),
    duration = 1.2,
    immediate = false,
  } = opts;

  if (!lenis) {
    nativeScrollTo(target, immediate);
    return;
  }

  lenis.scrollTo(target, { offset, duration, immediate });
}

function handleInitialHash(): void {
  if (typeof window === "undefined") return;
  const { hash } = window.location;
  if (!hash || hash.length < 2) return;

  requestAnimationFrame(() => {
    scrollTo(hash, { immediate: true });
  });
}

export { lenis };
