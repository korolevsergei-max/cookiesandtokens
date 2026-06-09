/**
 * offeringMotion.ts — bespoke, brand-tinted generative motion for the three
 * Offering sections. Replaces the old Unsplash stock backgrounds with coded
 * motion that embodies the brand thesis (human craft + AI underneath):
 *
 *   · Creative — self-drawing pen-stroke marks (the hand)     → initSketchField
 *   · Growth   — a momentum line + rising motes that climb    → initGrowthMomentum
 *   · Software — a streaming field of tokenized code lines    → initCodeField
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

/* ── Software: a streaming field of real, syntax-lit code ────────────────── */
//
// Renders faint, actual monospaced code (brand-flavored snippets) scrolling
// upward, with the bottom line "typing in" behind a blinking caret. Syntax is
// lightly colored — keywords purple, strings/values teal, everything else ink —
// so it reads as a live IDE/terminal rather than the abstract loading-skeleton
// bars this used to draw. Reduced-motion shows one settled, fully-typed frame.

// 0 ink · 1 keyword (purple) · 2 string/number/bool (teal) · 3 comment (dim ink)
type Hue = 0 | 1 | 2 | 3;
interface Seg {
  text: string;
  hue: Hue;
}
interface CodeLine {
  segs: Seg[];
  len: number; // total chars (drives the typing reveal)
  typed: number; // 0..1
  warmth: number; // 1 just-written → decays to 0 (glow cascade)
}

const LINE_H = 26;
const FONT_PX = 13;

const CODE_KEYWORDS = new Set([
  "const", "let", "var", "export", "default", "async", "await", "function",
  "return", "if", "else", "while", "for", "import", "from", "type",
  "interface", "new", "class", "extends",
]);

// Brand-flavored source. Indentation lives in the strings so monospace handles
// it for free; each line is a complete, plausible statement.
const CODE_SOURCE = [
  "const studio = createStudio({ ai: true });",
  "export async function ship(idea) {",
  "  const brand = await design(idea);",
  "  const growth = engine.run(brand);",
  "  return deploy(growth);",
  "}",
  "// human craft, AI underneath",
  "type Result = { fast: boolean; yours: true };",
  "const agents = spawn([\"ops\", \"research\"]);",
  "await Promise.all(tasks.map(run));",
  "if (review.passed) ship();",
  "let velocity = baseline * 3;",
  "import { craft } from \"./cookie\";",
  "import { speed } from \"./token\";",
  "const product = build(brand, growth);",
  "function automate(workflow) {",
  "  return agent.handle(workflow);",
  "}",
  "export default studio;",
  "while (!shipped) iterate();",
  "const api = new Server({ port: 443 });",
  "render(<App ready={true} />);",
];

function tokenizeCode(src: string): { segs: Seg[]; len: number } {
  if (src.trim().startsWith("//")) return { segs: [{ text: src, hue: 3 }], len: src.length };
  const segs: Seg[] = [];
  // whitespace · string · identifier · number · single punctuation
  const re = /(\s+|"[^"]*"|'[^']*'|`[^`]*`|[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|[^\w\s])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const t = m[0];
    let hue: Hue = 0;
    if (/^\s+$/.test(t)) hue = 0;
    else if (/^["'`]/.test(t) || /^\d/.test(t)) hue = 2;
    else if (CODE_KEYWORDS.has(t)) hue = t === "true" || t === "false" || t === "null" ? 2 : 1;
    segs.push({ text: t, hue });
  }
  return { segs, len: src.length };
}

function makeCodeLine(): CodeLine {
  const src = CODE_SOURCE[Math.floor(Math.random() * CODE_SOURCE.length)];
  const { segs, len } = tokenizeCode(src);
  return { segs, len, typed: 0, warmth: 0 };
}

export function initCodeField(canvas: HTMLCanvasElement, opts: { intensity?: number } = {}): SceneController {
  const k = opts.intensity ?? 1; // alpha multiplier — Software dials this up
  const inkA = 0.3 * k; // identifiers / punctuation
  const dimA = 0.2 * k; // comments
  const accentA = 0.5 * k; // keywords / strings
  let lines: CodeLine[] = [];
  let vy = 0; // scroll offset within a line height
  let rows = 0;
  let lh = 0;

  const ensure = (h: number) => {
    const need = Math.ceil(h / LINE_H) + 2;
    if (rows === need && h === lh) return;
    rows = need;
    lh = h;
    lines = Array.from({ length: need }, () => {
      const l = makeCodeLine();
      l.typed = 1; // existing lines are already written
      return l;
    });
    if (lines.length) lines[lines.length - 1].typed = 0; // bottom line types in
  };

  const render: RenderFn = (ctx, f) => {
    ensure(f.h);
    const { palette } = f;
    ctx.font = `${FONT_PX}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";
    const charW = ctx.measureText("0").width || FONT_PX * 0.6;

    const colorFor = (hue: Hue, a: number) =>
      hue === 1 ? rgba(palette.purpleDeep, a)
      : hue === 2 ? rgba(palette.teal, a)
      : hue === 3 ? rgba(palette.ink, a)
      : rgba(palette.ink, a);
    // accent for lit/warm lines — alternates purple / occasionally teal
    const accent = (r: number, a: number) => (r % 3 === 1 ? rgba(palette.teal, a) : rgba(palette.purpleDeep, a));

    const lastIdx = lines.length - 1;

    if (!f.reduced) {
      // stream upward; type in the bottom line
      vy += (f.dt / 1000) * 13; // px/sec scroll
      const bottom = lines[lastIdx];
      const wasTyping = bottom.typed < 1;
      bottom.typed = clamp01(bottom.typed + (f.dt / 1000) / 1.1);
      if (wasTyping && bottom.typed >= 1) bottom.warmth = 1; // just finished → glow then cool
      for (const l of lines) if (l.warmth > 0) l.warmth = Math.max(0, l.warmth - f.dt / 1400);
      if (vy >= LINE_H) {
        vy -= LINE_H;
        lines.shift();
        lines.push(makeCodeLine());
      }
    }

    const x0 = Math.round(f.w * 0.06);
    for (let r = 0; r < lines.length; r++) {
      const line = lines[r];
      const y = Math.round(r * LINE_H - vy + 14);
      if (y < -LINE_H || y > f.h + LINE_H) continue;
      const isActive = !f.reduced && r === lastIdx && line.typed < 1;
      const glow = isActive ? 1 : line.warmth;
      const shown = f.reduced ? line.len : Math.floor(line.typed * line.len);

      if (glow > 0.05) {
        ctx.save();
        ctx.shadowColor = accent(r, 0.5 * glow);
        ctx.shadowBlur = 8 * glow;
      }

      let x = x0;
      let drawn = 0;
      for (const seg of line.segs) {
        if (drawn >= shown) break;
        const visibleChars = Math.min(seg.text.length, shown - drawn);
        const text = seg.text.slice(0, visibleChars);
        if (text.trim().length) {
          let fill: string;
          if (isActive) {
            fill = accent(r, Math.min(0.6, inkA + 0.34));
          } else if (line.warmth > 0.05) {
            const a = (seg.hue === 0 ? inkA : seg.hue === 3 ? dimA : accentA) + line.warmth * 0.28;
            fill = accent(r, a);
          } else {
            fill = colorFor(seg.hue, seg.hue === 1 || seg.hue === 2 ? accentA : seg.hue === 3 ? dimA : inkA);
          }
          ctx.fillStyle = fill;
          ctx.fillText(text, x, y);
        }
        x += seg.text.length * charW;
        drawn += seg.text.length;
      }

      if (glow > 0.05) ctx.restore();

      // block typing caret on the active (bottom) line
      if (isActive) {
        const blink = Math.sin(f.time / 140) > 0 ? 1 : 0.25;
        ctx.fillStyle = rgba(palette.purpleDeep, 0.6 * blink);
        ctx.fillRect(x, y + 1, Math.max(2, charW * 0.6), FONT_PX);
      }
    }

    // slow vertical scan band — a soft highlight sweeping down the field
    if (!f.reduced) {
      const period = 7000;
      const sy = ((f.time % period) / period) * (f.h + 120) - 60;
      const band = ctx.createLinearGradient(0, sy - 60, 0, sy + 60);
      band.addColorStop(0, rgba(palette.purple, 0));
      band.addColorStop(0.5, rgba(palette.teal, 0.04 * k));
      band.addColorStop(1, rgba(palette.purple, 0));
      ctx.fillStyle = band;
      ctx.fillRect(0, sy - 60, f.w, 120);
    }
  };

  // Ambient: runs while visible.
  return mountScene(canvas, render, { autoPlay: true });
}
