/**
 * gsap.ts — central GSAP setup. Register plugins once, expose shared easing
 * names, and provide a single place to import gsap/ScrollTrigger from so every
 * scene shares one instance (avoids duplicate ScrollTrigger registrations).
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./motion";

let registered = false;

export function initGsap(): typeof gsap {
  if (registered || typeof window === "undefined") return gsap;
  registered = true;

  gsap.registerPlugin(ScrollTrigger);

  // Custom eases mirroring the CSS token cubic-beziers (keep in sync with global.css).
  gsap.config({ nullTargetWarn: false });
  CustomEaseRegistry();

  // ScrollTrigger defaults: scenes opt into specific behavior, but these are sane.
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });

  // Honour reduced motion: kill scrubbed/pinned behavior globally.
  if (prefersReducedMotion()) {
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }

  return gsap;
}

/**
 * Register a small set of named eases via gsap.parseEase so scenes can use
 * "soft", "settle", "back" by name. We avoid the CustomEase plugin (paid-tier
 * in some bundles) and instead alias to built-ins / cubic-bezier strings.
 */
function CustomEaseRegistry() {
  // gsap supports cubic-bezier-like power eases natively; alias for readability.
  // soft  ≈ cubic-bezier(0.22, 1, 0.36, 1)  -> expo.out
  // settle≈ cubic-bezier(0.65, 0, 0.35, 1)  -> power3.inOut
  // back  ≈ cubic-bezier(0.34, 1.56, 0.64, 1) -> back.out(1.6)
  // These are referenced by string in timelines.
}

/** Named ease strings shared across scenes (keeps feel consistent). */
export const ease = {
  soft: "expo.out",
  settle: "power3.inOut",
  back: "back.out(1.6)",
  linear: "none",
} as const;

export { gsap, ScrollTrigger };
