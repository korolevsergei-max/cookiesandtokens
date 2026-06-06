/**
 * cursor.ts — custom cursor primitive.
 *
 * A small follower dot + a larger trailing ring that lerp toward the pointer.
 * Elements opt into states via data attributes:
 *   data-cursor="cookie" | "token" | "link" | "drag" | "hidden"
 *   data-cursor-label="View"   (optional text shown inside the ring)
 *
 * Skipped on coarse pointers and under reduced motion (the ring still appears
 * but without lerp/parallax — handled by caller). Returns a cleanup fn.
 */
import { isCoarsePointer, prefersReducedMotion } from "./motion";

type CursorState = "default" | "cookie" | "token" | "link" | "drag" | "hidden";

export interface CursorHandle {
  destroy: () => void;
  setState: (s: CursorState) => void;
}

export function initCursor(): CursorHandle | null {
  if (typeof window === "undefined") return null;
  if (isCoarsePointer()) return null; // touch — use native, no custom cursor

  const reduced = prefersReducedMotion();

  // Build DOM
  const root = document.createElement("div");
  root.className = "ct-cursor";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <span class="ct-cursor__ring"></span>
    <span class="ct-cursor__dot"></span>
    <span class="ct-cursor__label"></span>
  `;
  document.body.appendChild(root);

  const ring = root.querySelector<HTMLElement>(".ct-cursor__ring")!;
  const dot = root.querySelector<HTMLElement>(".ct-cursor__dot")!;
  const label = root.querySelector<HTMLElement>(".ct-cursor__label")!;

  // Pointer + lerped position
  let px = window.innerWidth / 2;
  let py = window.innerHeight / 2;
  let rx = px;
  let ry = py;
  let raf = 0;
  let visible = false;

  const onMove = (e: PointerEvent) => {
    px = e.clientX;
    py = e.clientY;
    if (!visible) {
      visible = true;
      root.classList.add("is-visible");
    }
    // Dot tracks exactly (snappy); ring trails via rAF lerp.
    dot.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    if (reduced) {
      ring.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    }
  };

  const tick = () => {
    rx += (px - rx) * 0.18;
    ry += (py - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    label.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    raf = requestAnimationFrame(tick);
  };

  const onLeave = () => {
    visible = false;
    root.classList.remove("is-visible");
  };
  const onDown = () => root.classList.add("is-down");
  const onUp = () => root.classList.remove("is-down");

  // Delegated hover-state detection via [data-cursor] ancestors.
  const onOver = (e: PointerEvent) => {
    const el = (e.target as HTMLElement)?.closest?.("[data-cursor]");
    const state = (el?.getAttribute("data-cursor") as CursorState) ?? "default";
    const text = el?.getAttribute("data-cursor-label") ?? "";
    setState(state);
    label.textContent = text;
    root.classList.toggle("has-label", Boolean(text));
  };

  function setState(s: CursorState) {
    root.dataset.state = s;
  }

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerover", onOver, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  document.addEventListener("pointerleave", onLeave);

  if (!reduced) raf = requestAnimationFrame(tick);

  // Hide the native cursor only once ours is active.
  document.documentElement.classList.add("ct-cursor-active");

  return {
    setState,
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("ct-cursor-active");
      root.remove();
    },
  };
}
