/**
 * reveal.ts — one shared scroll-reveal vocabulary for every content section.
 *
 * Phase 4 built each section's reveal ad-hoc (different eases, distances,
 * durations, and trigger thresholds), so the page felt subtly uneven on the
 * way down. This centralizes the recipe: every section enters with the same
 * ease, the same travel distance, the same trigger line — so the whole scroll
 * reads as one cohesive, deliberately-tuned motion language.
 *
 * Tunables live here (and only here). Sections call `reveal(el, { ... })`.
 * Fully reduced-motion safe: under reduce we skip the tween entirely and leave
 * the element in its natural (visible) state.
 */
import { gsap, ease, ScrollTrigger } from "./gsap";
import { prefersReducedMotion } from "./motion";

/** The canonical reveal tuning. Keep these few constants as the single source. */
const REVEAL = {
  y: 32, // travel distance — enough to feel, not enough to flag perf
  duration: 0.8,
  stagger: 0.09,
  start: "top 80%", // one trigger line for the entire page
} as const;

export interface RevealOptions {
  /** Override the start travel distance (px). */
  y?: number;
  /** Stagger between children when `targets` is a list. */
  stagger?: number;
  /** Delay before the tween (s). */
  delay?: number;
  /** ScrollTrigger start string. Defaults to the shared page line. */
  start?: string;
  /** Trigger element. Defaults to the first target. */
  trigger?: Element | null;
  /** Add a gentle scale pop (for emphasis elements like stats/venn). */
  pop?: boolean;
}

type Targets = Element | Element[] | NodeListOf<Element> | null;

/**
 * Reveal one or many elements on scroll-in with the shared recipe.
 * Returns the created tween (or null under reduced motion / no targets).
 */
export function reveal(targets: Targets, opts: RevealOptions = {}) {
  if (!targets) return null;
  const list = normalize(targets);
  if (!list.length) return null;

  if (prefersReducedMotion()) return null;

  const {
    y = REVEAL.y,
    stagger = REVEAL.stagger,
    delay = 0,
    start = REVEAL.start,
    trigger = list[0],
    pop = false,
  } = opts;

  return gsap.from(list, {
    opacity: 0,
    y,
    scale: pop ? 0.94 : 1,
    duration: REVEAL.duration,
    stagger: list.length > 1 ? stagger : 0,
    delay,
    ease: pop ? ease.pop : ease.reveal,
    scrollTrigger: { trigger, start, once: true },
  });
}

/**
 * Count a numeric stat up from 0 when it scrolls into view, preserving any
 * prefix/suffix in the original text (e.g. "3×", "60%", "100%"). Reduced-motion
 * leaves the final value untouched.
 */
export function countUp(el: HTMLElement, opts: { duration?: number; trigger?: Element | null } = {}) {
  if (prefersReducedMotion()) return;

  const raw = el.textContent?.trim() ?? "";
  const match = raw.match(/^(\D*)(\d[\d.,]*)(\D*)$/);
  if (!match) return; // non-numeric (e.g. "∞") — leave as-is

  const [, prefix, numStr, suffix] = match;
  const target = parseFloat(numStr.replace(/,/g, ""));
  const decimals = (numStr.split(".")[1] ?? "").length;

  const state = { v: 0 };
  el.textContent = `${prefix}0${suffix}`;

  gsap.to(state, {
    v: target,
    duration: opts.duration ?? 1.4,
    ease: "power2.out",
    scrollTrigger: { trigger: opts.trigger ?? el, start: REVEAL.start, once: true },
    onUpdate: () => {
      el.textContent = `${prefix}${state.v.toFixed(decimals)}${suffix}`;
    },
  });
}

function normalize(targets: Targets): Element[] {
  if (!targets) return [];
  if (targets instanceof Element) return [targets];
  return Array.from(targets as ArrayLike<Element>);
}

export { ScrollTrigger };
