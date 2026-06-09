/**
 * offeringMotion.ts — bespoke, brand-tinted generative motion for the three
 * Offering sections. Replaces the old Unsplash stock backgrounds with coded
 * motion that embodies the brand thesis (human craft + AI underneath):
 *
 *   · Creative — self-drawing pen-stroke marks (the hand)     → initSketchField
 *   · Growth   — a momentum line + rising motes that climb    → initGrowthMomentum
 *   · Software — a schematic system diagram that draws once   → initSoftwareSchematic
 *
 * Every scene is reduced-motion safe (renders one settled static frame and
 * never starts a loop), pauses itself when scrolled offscreen (Intersection
 * Observer), caps DPR, re-fits on resize, and pulls its colors from the
 * global.css design tokens so it stays in sync with the palette.
 *
 * Renderers are pure draw functions over a `Frame`; the shared `mountScene`
 * engine owns the rAF loop, visibility gating, sizing, and reduced-motion.
 */
import { prefersReducedMotion } from "./motion";

export interface SceneController {
  /** Allow the loop to run (it still only animates while on-screen). */
  play(): void;
  /** Stop animating; leaves the last drawn frame in place. */
  pause(): void;
  /** Feed an external 0..1 driver (used by Growth's scroll progress). */
  setProgress(p: number): void;
  /** Tear everything down (observers + rAF). */
  destroy(): void;
}

interface Palette {
  purple: string;
  purpleDeep: string;
  teal: string;
  tealBright: string;
  navy: string;
  cream: string;
  ink: string;
}

interface Frame {
  w: number;
  h: number;
  /** ms since mount. */
  time: number;
  /** ms since previous frame (clamped). */
  dt: number;
  /** External 0..1 driver; defaults per scene. */
  progress: number;
  /** True → draw one settled frame, no animation. */
  reduced: boolean;
  palette: Palette;
}

type RenderFn = (ctx: CanvasRenderingContext2D, frame: Frame) => void;

interface MountOptions {
  /** Ambient scenes auto-run when visible; hover scenes start paused. */
  autoPlay?: boolean;
  /** Initial 0..1 progress (Growth shows a settled "grown" state by default). */
  defaultProgress?: number;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/* ── palette plumbing ────────────────────────────────────────────────────── */

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function readPalette(): Palette {
  return {
    purple: cssVar("--color-purple", "#a974e8"),
    purpleDeep: cssVar("--color-purple-deep", "#8b54d4"),
    teal: cssVar("--color-teal", "#3fd9c0"),
    tealBright: cssVar("--color-teal-bright", "#6fe8d4"),
    navy: cssVar("--color-navy", "#11112e"),
    cream: cssVar("--color-cream", "#f5efe6"),
    ink: cssVar("--color-ink", "#11112e"),
  };
}

/** "#rrggbb" → "rgba(r,g,b,a)". Tolerates already-rgb() strings by passing through. */
function rgba(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/* ── shared engine ───────────────────────────────────────────────────────── */

const noop: SceneController = {
  play() {},
  pause() {},
  setProgress() {},
  destroy() {},
};

function mountScene(canvas: HTMLCanvasElement, render: RenderFn, options: MountOptions = {}): SceneController {
  const ctx = canvas.getContext("2d");
  if (!ctx) return noop;

  const palette = readPalette();
  const reduced = prefersReducedMotion();

  let progress = options.defaultProgress ?? 0;
  let w = 1;
  let h = 1;
  let raf = 0;
  let running = false;
  let visible = false;
  let wantPlay = options.autoPlay ?? true;
  const mountedAt = performance.now();
  let prev = mountedAt;

  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!running) drawStatic();
  }

  function drawStatic() {
    ctx!.clearRect(0, 0, w, h);
    render(ctx!, { w, h, time: 6000, dt: 16, progress, reduced: true, palette });
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(48, now - prev);
    prev = now;
    ctx!.clearRect(0, 0, w, h);
    render(ctx!, { w, h, time: now - mountedAt, dt, progress, reduced: false, palette });
  }

  function startLoop() {
    if (running || reduced || !visible || !wantPlay) return;
    running = true;
    prev = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stopLoop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startLoop();
      else stopLoop();
    },
    { threshold: 0, rootMargin: "10% 0px" }
  );
  io.observe(canvas);

  const ro = new ResizeObserver(() => fit());
  ro.observe(canvas);

  fit();
  if (reduced) drawStatic();

  return {
    play() {
      wantPlay = true;
      startLoop();
    },
    pause() {
      wantPlay = false;
      stopLoop();
    },
    setProgress(p: number) {
      progress = clamp01(p);
      if (!running) drawStatic();
    },
    destroy() {
      stopLoop();
      io.disconnect();
      ro.disconnect();
    },
  };
}

/* ── Creative: self-drawing pen-stroke marks ─────────────────────────────── */

interface Stroke {
  pts: { x: number; y: number }[];
  offset: number; // cycle stagger (ms)
  ink: boolean; // ink hairline vs purple
}

const SKETCH_CYCLE = 4600; // ms per draw-hold-fade loop

function sampleCubic(p0: number[], p1: number[], p2: number[], p3: number[], n: number) {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const a = u * u * u,
      b = 3 * u * u * t,
      c = 3 * u * t * t,
      d = t * t * t;
    out.push({
      x: a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
      y: a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
    });
  }
  return out;
}

// Hover variant — loose marks biased to the right half (the row's reveal zone).
const SKETCH_RIGHT: { p: number[][]; ink: boolean }[] = [
  { p: [[0.46, 0.72], [0.58, 0.30], [0.74, 0.78], [0.92, 0.34]], ink: false },
  { p: [[0.52, 0.42], [0.66, 0.66], [0.80, 0.28], [0.97, 0.52]], ink: true },
  { p: [[0.44, 0.30], [0.60, 0.52], [0.70, 0.22], [0.88, 0.46]], ink: false },
  { p: [[0.58, 0.84], [0.70, 0.50], [0.84, 0.80], [0.99, 0.44]], ink: true },
];

// Ambient variant — spread across the whole section, biased to the top header
// band + side margins so it reads loudest in the empty space.
const SKETCH_AMBIENT: { p: number[][]; ink: boolean }[] = [
  { p: [[0.04, 0.20], [0.16, 0.06], [0.28, 0.22], [0.40, 0.10]], ink: false },
  { p: [[0.60, 0.10], [0.72, 0.26], [0.82, 0.08], [0.96, 0.20]], ink: true },
  { p: [[0.30, 0.34], [0.42, 0.20], [0.52, 0.36], [0.66, 0.24]], ink: false },
  { p: [[0.08, 0.50], [0.20, 0.66], [0.30, 0.46], [0.44, 0.60]], ink: true },
  { p: [[0.54, 0.44], [0.66, 0.60], [0.78, 0.40], [0.92, 0.54]], ink: false },
  { p: [[0.02, 0.80], [0.14, 0.66], [0.26, 0.84], [0.40, 0.70]], ink: true },
  { p: [[0.58, 0.82], [0.70, 0.66], [0.82, 0.84], [0.98, 0.68]], ink: false },
  { p: [[0.34, 0.92], [0.46, 0.78], [0.58, 0.94], [0.72, 0.80]], ink: true },
];

function buildStrokes(w: number, h: number, ambient = false): Stroke[] {
  // Geometry is deterministic per size.
  const defs = ambient ? SKETCH_AMBIENT : SKETCH_RIGHT;
  const stagger = ambient ? 520 : 720;
  return defs.map((d, i) => ({
    pts: sampleCubic(
      [d.p[0][0] * w, d.p[0][1] * h],
      [d.p[1][0] * w, d.p[1][1] * h],
      [d.p[2][0] * w, d.p[2][1] * h],
      [d.p[3][0] * w, d.p[3][1] * h],
      52
    ),
    offset: i * stagger,
    ink: d.ink,
  }));
}

function drawSketch(ctx: CanvasRenderingContext2D, f: Frame, strokes: Stroke[], alphaMul = 1) {
  const { palette } = f;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.6;

  for (const s of strokes) {
    let drawFrac = 1;
    let alpha = 1;
    if (!f.reduced) {
      const u = (((f.time - s.offset) % SKETCH_CYCLE) + SKETCH_CYCLE) % SKETCH_CYCLE;
      const phase = u / SKETCH_CYCLE; // 0..1
      // draw-on over first half (eased), hold, fade over last 22%
      const dp = clamp01(phase / 0.5);
      drawFrac = dp * dp * (3 - 2 * dp); // smoothstep
      alpha = phase > 0.78 ? 1 - (phase - 0.78) / 0.22 : Math.min(1, phase / 0.06);
    }
    ctx.strokeStyle = s.ink ? rgba(palette.ink, 0.16 * alpha * alphaMul) : rgba(palette.purpleDeep, 0.42 * alpha * alphaMul);

    const last = Math.max(1, Math.floor(drawFrac * (s.pts.length - 1)));
    ctx.beginPath();
    ctx.moveTo(s.pts[0].x, s.pts[0].y);
    for (let i = 1; i <= last; i++) ctx.lineTo(s.pts[i].x, s.pts[i].y);
    ctx.stroke();

    // leading nib dot
    if (!f.reduced && drawFrac < 1) {
      const p = s.pts[last];
      ctx.fillStyle = rgba(palette.purple, 0.5 * alpha * alphaMul);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // a couple of registration "+" marks, gently pulsing
  const marks = [
    { x: 0.62, y: 0.24 },
    { x: 0.86, y: 0.7 },
  ];
  marks.forEach((m, i) => {
    const pulse = f.reduced ? 0.5 : 0.35 + 0.25 * (Math.sin(f.time / 900 + i * 2) * 0.5 + 0.5);
    const x = m.x * f.w;
    const y = m.y * f.h;
    const r = 6;
    ctx.strokeStyle = rgba(palette.purple, 0.35 * pulse * 2 * alphaMul);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
  });
}

export function initSketchField(canvas: HTMLCanvasElement, opts: { ambient?: boolean } = {}): SceneController {
  const ambient = !!opts.ambient;
  const alphaMul = ambient ? 0.6 : 1; // ambient sits behind the whole section
  let strokes: Stroke[] | null = null;
  let lw = 0;
  let lh = 0;
  const render: RenderFn = (ctx, f) => {
    if (!strokes || f.w !== lw || f.h !== lh) {
      lw = f.w;
      lh = f.h;
      strokes = buildStrokes(f.w, f.h, ambient);
    }
    drawSketch(ctx, f, strokes, alphaMul);
  };
  // ambient → always-on while visible; hover variant starts paused and the row
  // plays/pauses it on enter/leave.
  return mountScene(canvas, render, { autoPlay: ambient });
}

/* ── Growth: a momentum line + rising motes ──────────────────────────────── */

interface Mote {
  x: number;
  y: number;
  r: number;
  spd: number;
  tw: number; // twinkle phase
}

function buildMotes(w: number, h: number, n: number): Mote[] {
  const out: Mote[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.8,
      spd: 6 + Math.random() * 22, // px/sec upward
      tw: Math.random() * Math.PI * 2,
    });
  }
  return out;
}

/** Smooth ascending control points, bottom-left → top-right with gentle swells. */
function growthCurve(w: number, h: number): { x: number; y: number }[] {
  const ys = [0.86, 0.8, 0.7, 0.74, 0.58, 0.5, 0.4, 0.44, 0.3, 0.2];
  return ys.map((yy, i) => ({ x: (i / (ys.length - 1)) * w, y: yy * h }));
}

export function initGrowthMomentum(canvas: HTMLCanvasElement): SceneController {
  let motes: Mote[] = [];
  let curve: { x: number; y: number }[] = [];
  let lw = 0;
  let lh = 0;

  const render: RenderFn = (ctx, f) => {
    if (f.w !== lw || f.h !== lh) {
      lw = f.w;
      lh = f.h;
      motes = buildMotes(f.w, f.h, 40);
      curve = growthCurve(f.w, f.h);
    }
    const { palette } = f;
    const prog = f.reduced ? 0.62 : Math.max(0.08, f.progress);

    // faint chart gridlines
    ctx.strokeStyle = rgba(palette.teal, 0.05);
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = f.h * (i / 4);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(f.w, y);
      ctx.stroke();
    }

    // resolve the polyline up to `prog` (last point partial)
    const segs = curve.length - 1;
    const head = prog * segs;
    const full = Math.floor(head);
    const frac = head - full;
    const drawn: { x: number; y: number }[] = curve.slice(0, full + 1).map((p) => ({ ...p }));
    if (full < segs) {
      const a = curve[full];
      const b = curve[full + 1];
      drawn.push({ x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac });
    }

    // area fill under the drawn line
    if (drawn.length > 1) {
      const tip = drawn[drawn.length - 1];
      const grad = ctx.createLinearGradient(0, 0, 0, f.h);
      grad.addColorStop(0, rgba(palette.teal, 0.1));
      grad.addColorStop(1, rgba(palette.teal, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(drawn[0].x, f.h);
      for (const p of drawn) ctx.lineTo(p.x, p.y);
      ctx.lineTo(tip.x, f.h);
      ctx.closePath();
      ctx.fill();

      // the momentum line itself
      ctx.strokeStyle = rgba(palette.teal, 0.55);
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(drawn[0].x, drawn[0].y);
      for (let i = 1; i < drawn.length; i++) ctx.lineTo(drawn[i].x, drawn[i].y);
      ctx.stroke();

      // glowing leading node
      ctx.save();
      ctx.shadowColor = rgba(palette.tealBright, 0.9);
      ctx.shadowBlur = 18;
      ctx.fillStyle = rgba(palette.tealBright, 0.95);
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // rising motes — density scales with progress
    const count = Math.floor(motes.length * (0.4 + 0.6 * prog));
    const dts = f.dt / 1000;
    for (let i = 0; i < count; i++) {
      const m = motes[i];
      if (!f.reduced) {
        m.y -= m.spd * dts;
        m.tw += dts * 1.6;
        if (m.y < -4) {
          m.y = f.h + 4;
          m.x = Math.random() * f.w;
        }
      }
      const tw = 0.35 + 0.65 * (Math.sin(m.tw) * 0.5 + 0.5);
      ctx.fillStyle = rgba(palette.teal, 0.4 * tw);
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Ambient: runs while visible. Default progress shows a confidently "grown"
  // line even before the scroll driver kicks in (mobile / first paint).
  return mountScene(canvas, render, { autoPlay: true, defaultProgress: 0.62 });
}

/* ── Software: a schematic system diagram that draws once ────────────────── */
//
// Four square nodes joined by orthogonal traces — a quiet architecture
// drawing, not readable code. The renderer is purely progress-driven: the
// component tweens setProgress(0→1) once on scroll-in and the diagram then
// stays permanently static (no rAF loop ever runs — autoPlay: false). Crisp
// butt caps and miter joins keep it drafting-table, distinct from Creative's
// hand-drawn round-cap sketches.

interface SchematicNode {
  x: number;
  y: number;
  /** Progress at which this node's inbound trace arrives. */
  at: number;
}

/** Hermite smoothstep of p over [a, b]. */
function smoothstep(a: number, b: number, p: number): number {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
}

export function initSoftwareSchematic(canvas: HTMLCanvasElement): SceneController {
  const NODE = 10; // square side, px

  const nodes: SchematicNode[] = [
    { x: 0.10, y: 0.18, at: 0.02 },
    { x: 0.46, y: 0.18, at: 0.30 },
    { x: 0.46, y: 0.62, at: 0.50 },
    { x: 0.86, y: 0.40, at: 0.90 }, // terminus
  ];

  // Orthogonal polylines (normalized), each drawn over a progress window.
  const traces: { pts: number[][]; a: number; b: number; accent: boolean }[] = [
    { pts: [[0.10, 0.18], [0.46, 0.18]], a: 0.00, b: 0.30, accent: false },
    { pts: [[0.46, 0.18], [0.46, 0.62]], a: 0.22, b: 0.50, accent: false },
    { pts: [[0.46, 0.18], [0.86, 0.18], [0.86, 0.40]], a: 0.42, b: 0.78, accent: true },
    { pts: [[0.46, 0.62], [0.86, 0.62], [0.86, 0.40]], a: 0.60, b: 0.92, accent: false },
  ];

  const marks = [
    { x: 0.24, y: 0.80 },
    { x: 0.68, y: 0.10 },
  ];

  const render: RenderFn = (ctx, f) => {
    // Keyed entirely off progress (the external draw-once driver); `reduced`
    // is irrelevant here because progress 1 IS the settled frame.
    const p = f.progress;
    const { palette } = f;
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1.25;

    for (const t of traces) {
      const reveal = smoothstep(t.a, t.b, p);
      if (reveal <= 0) continue;
      const pts = t.pts.map(([x, y]) => ({ x: x * f.w, y: y * f.h }));
      let total = 0;
      const lens: number[] = [];
      for (let i = 1; i < pts.length; i++) {
        const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        lens.push(len);
        total += len;
      }
      let remain = total * reveal;
      ctx.strokeStyle = t.accent ? rgba(palette.purpleDeep, 0.4) : rgba(palette.ink, 0.16);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length && remain > 0; i++) {
        const seg = Math.min(lens[i - 1], remain);
        const k = seg / lens[i - 1];
        ctx.lineTo(
          pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k,
          pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k
        );
        remain -= seg;
      }
      ctx.stroke();
    }

    nodes.forEach((n, i) => {
      const a = smoothstep(n.at, n.at + 0.08, p);
      if (a <= 0) return;
      const x = n.x * f.w - NODE / 2;
      const y = n.y * f.h - NODE / 2;
      const terminus = i === nodes.length - 1;
      if (terminus) {
        ctx.fillStyle = rgba(palette.purpleDeep, 0.3 * a);
        ctx.fillRect(x, y, NODE, NODE);
      }
      ctx.strokeStyle = terminus ? rgba(palette.purpleDeep, 0.5 * a) : rgba(palette.ink, 0.25 * a);
      ctx.strokeRect(x, y, NODE, NODE);
    });

    const markA = smoothstep(0.86, 1, p);
    if (markA > 0) {
      ctx.strokeStyle = rgba(palette.purple, 0.3 * markA);
      for (const m of marks) {
        const x = m.x * f.w;
        const y = m.y * f.h;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.stroke();
      }
    }
  };

  return mountScene(canvas, render, { autoPlay: false, defaultProgress: 0 });
}

