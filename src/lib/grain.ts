/**
 * grain.ts — subtle animated film grain over the whole page.
 *
 * Cheap approach: pre-render a few small monochrome noise tiles to offscreen
 * canvases, then on a throttled rAF fill a full-viewport canvas using
 * ctx.createPattern (tiling the small tile). No per-frame noise generation and
 * no per-frame toDataURL — just a pattern fill, which is GPU-cheap.
 *
 * Disabled under reduced motion (a single static tile, no animation).
 * Returns a cleanup fn.
 */
import { prefersReducedMotion } from "./motion";

interface GrainOptions {
  opacity?: number; // 0..1 overlay opacity
  tileSize?: number; // px noise tile (smaller = finer)
  frames?: number; // number of pre-rendered noise frames to cycle
  fps?: number; // animation rate
}

export function initGrain(opts: GrainOptions = {}): () => void {
  if (typeof window === "undefined") return () => {};

  const { opacity = 0.05, tileSize = 120, frames = 5, fps = 16 } = opts;
  const reduced = prefersReducedMotion();

  const canvas = document.createElement("canvas");
  canvas.className = "ct-grain";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.opacity = String(opacity);
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};
  document.body.appendChild(canvas);

  // Build pre-rendered noise tiles -> CanvasPattern[]
  const patterns: CanvasPattern[] = [];
  const frameCount = reduced ? 1 : frames;
  for (let f = 0; f < frameCount; f++) {
    const tile = document.createElement("canvas");
    tile.width = tile.height = tileSize;
    const tctx = tile.getContext("2d")!;
    const img = tctx.createImageData(tileSize, tileSize);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    tctx.putImageData(img, 0, 0);
    const p = ctx.createPattern(tile, "repeat");
    if (p) patterns.push(p);
  }
  if (!patterns.length) {
    canvas.remove();
    return () => {};
  }

  let dpr = 1; // grain is intentionally low-res; keep dpr=1 for perf
  const resize = () => {
    canvas.width = Math.ceil(window.innerWidth * dpr);
    canvas.height = Math.ceil(window.innerHeight * dpr);
    paint(0);
  };

  let cur = 0;
  const paint = (idx: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = patterns[idx];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  let raf = 0;
  let last = 0;
  const interval = 1000 / fps;
  const draw = (t: number) => {
    if (t - last >= interval) {
      last = t;
      cur = (cur + 1) % patterns.length;
      paint(cur);
    }
    raf = requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  resize();
  if (!reduced && patterns.length > 1) raf = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    canvas.remove();
  };
}
