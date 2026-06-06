# Cookies & Tokens — Flagship Agency Site: Build Plan

## Context
We're building the public website for **Cookies & Tokens**, a creative agency whose thesis is "AI-supercharged human craft" — using the best AI to superpower the best creatives, driving **better outcomes at better value** (premium, *not* low-cost). The site is the agency's primary sales asset: when someone is referred, this is where they "get it" and feel something. So it must be a best-in-class 2026 digital experience — a single endless-scroll landing page with scroll-driven storytelling, not a bland template.

The brand assets already encode the concept: a **purple cookie** (human craft → brand, content, creative strategy), a **teal octagon "token"** (machine → AI workflows, automation, tech stack/SaaS), and a **combined lockup** where the cookie overlaps the octagon — literally the Venn diagram of "the full package." The whole site is built around making that overlap *felt*.

### Decisions locked (from kickoff Q&A)
- **Stack:** Astro + Tailwind + GSAP (ScrollTrigger) + Lenis. Framework-free islands (vanilla TS client scripts) for max performance; add a UI framework only if a section truly needs reactive state.
- **Scope of first pass:** the full one-pager — every section, the signature collision scroll, real layout + motion, with my draft copy.
- **Copy:** I draft all copy in the brand voice; user edits/replaces.
- **Motion ceiling:** "balanced flagship" — SVG cookie/token morph + GSAP scrubbed scroll + cursor parallax + subtle WebGL/canvas grain + custom cursor, with a full `prefers-reduced-motion` fallback. Fast and accessible, max wow-per-byte.

### Interpretations I'm running with (flag if wrong)
- "Endless / forever scroll" = **one long continuous single-page** site (no pagination), **not** a literally-looping infinite scroll. ("So it's all just one big landing page.")
- The hero **"choose your path"** (Cookie / Token / Venn) doubles as the **primary navigation**: hover reveals what each represents; click smooth-scrolls to that section.

---

## Experience Architecture (the scroll spine)
A single `index.astro` composed of sections, top to bottom:

1. **Preloader** — short, on-brand: the cookie and octagon assemble into the lockup, % counter, skippable. Sets a premium tone, hides first-paint/asset load. (Respects reduced-motion: instant.)
2. **Hero — "Choose Your Path"** *(signature interactive #1)* — full-viewport, deep-navy. Purple cookie (left), teal token (right), an overlap "Venn" zone (center). Three hover/click hotzones:
   - Cookie → "Brand · Content · Creative Strategy" (purple accent)
   - Token → "AI Workflows · Automation · Tech Stack / AI SaaS" (teal accent)
   - Venn → "The Full Package" (purple→teal gradient)
   Idle micro-motion + cursor parallax on the shapes. Headline, sub, scroll cue. Acts as the nav.
3. **Manifesto** — big scroll-scrubbed, word-by-word statement establishing the thesis ("We don't replace the best people — we give them superpowers"). The verbal mission.
4. **The Collision** *(signature scroll moment #2 — the centerpiece)* — pinned, scroll-scrubbed scene where the cookie runs in from the left and the token from the right, scale up, and **overlap into the Venn**, landing exactly on the combined logo. Parallax depth layers (crumbs, sprinkles, octagon facets). Labels resolve: "Craft" / "Tech" / "= Outcomes." Detailed spec below.
5. **The Cookie side — "Human Craft"** — purple-world section: brand & identity, content & creative, creative strategy, campaigns. Cursor-reactive service cards / pinned horizontal cards.
6. **The Token side — "Machine Intelligence"** — teal-world section, intentional mirror of the Cookie side: AI workflows, automation, custom tech stack, AI SaaS, measurement.
7. **The Overlap — "The Full Package"** — gradient section; an interactive Venn where clicking each region reveals what lives there. The core value prop and the differentiator vs. (a) traditional agencies with no AI leverage and (b) pure-AI tools with no craft.
8. **How we work — "The Recipe"** — process steps (e.g. 01 Listen → 02 Build the system → 03 Supercharge → 04 Scale), revealed on scroll.
9. **Proof / Outcomes** — case studies or, pre-clients, outcome stats / "what good looks like" / counters + a selected-work marquee. (Content depends on what's real yet — see Open Items.)
10. **About — "Humans + Machines"** — the people and philosophy; founders; "best creatives, AI-native."
11. **CTA — "Let's bake something"** — big closing, email/calendar/form, the cookie+token lockup.
12. **Footer** — minimal, on-brand, wordmark, socials, a "made by humans + machines" line.

A thin **sticky mini-nav** appears after the hero (logo mark + jump links + a single CTA), collapsing the "choose your path" zones into compact nav.

---

## The Collision Scene — spec (the make-or-break)
- **Mechanism:** GSAP `ScrollTrigger` with `pin: true` and `scrub` on a tall (≈250–300vh) section. Animation progress is tied to scroll position, so the user *drives* it.
- **Shapes:** clean **SVG** recreations of the cookie (circle + bite + crumb/sprinkle groups) and token (octagon outline) — vector so they stay crisp and each sub-part is independently animatable. Sourced/traced from the PNGs in `assets/`.
- **Choreography (scrubbed timeline):** (0%) shapes off-screen left/right, small → (40%) they accelerate toward center, scaling up, slight rotation/wobble → (65%) they meet and overlap; overlap lens brightens with the purple→teal gradient → (80%) labels "Craft / Tech / = Outcomes" fade in → (100%) settles into the exact combined logo lockup, headline resolves.
- **Depth:** crumbs, sprinkles, and octagon facets are separate parallax layers moving at different scrub rates.
- **Mobile:** simplified vertical choreography (shapes converge top/bottom, shorter pin) — designed, not an afterthought.
- **Reduced-motion:** no pin/scrub; show the resolved Venn lockup + labels statically with a gentle fade.

---

## Design System
- **Color:** navy base `#11112E` (primary dark) · purple `#A974E8` · teal `#3FD9C0` · cream `#F5EFE6` · white. Purple→teal gradient reserved for "overlap" moments. Alternate a few **light sections** (navy-on-cream) for rhythm — the brand has both light and dark logo versions.
- **Type:** display = **Clash Display** (geometric, matches the wordmark); body = **General Sans** / **Satoshi** (Fontshare — free, commercial-ok). Big confident headline scale; generous spacing.
- **Motion language:** Lenis momentum scroll site-wide; GSAP ScrollTrigger for pinned/scrubbed scenes; cursor-proximity parallax; soft easing (custom cubic-beziers); "breathing" idle states.
- **Texture:** subtle film grain (canvas/WebGL), soft gradient blobs, faint octagon-dot grid background; tasteful **custom cursor** that morphs over interactive zones (cookie/token).
- **Accessibility & perf baseline:** full `prefers-reduced-motion` path, keyboard-navigable, semantic landmarks, lazy-loaded media, optimized SVG/images, Lighthouse-minded.

---

## Tech Architecture & File Structure
```
cookiesandtokens/
  astro.config.mjs          # Astro + Tailwind(v4) integration, sitemap
  package.json
  public/
    favicon.svg             # token octagon
    og-image.png            # social share
  src/
    assets/                 # source PNGs (existing) + generated SVGs
      cookie.svg  token.svg  logo-lockup-{light,dark}.svg
    styles/global.css       # Tailwind v4 @theme tokens, base, fonts
    lib/
      lenis.ts              # smooth scroll init (+ ScrollTrigger sync)
      gsap.ts               # register/init ScrollTrigger + easing helpers
      cursor.ts             # custom cursor
      grain.ts              # canvas/WebGL grain
      motion.ts             # prefers-reduced-motion guard
    components/
      Preloader, Nav, Hero, CollisionScene, Manifesto,
      CookieSide, TokenSide, Overlap, Process, Proof, About, CTA, Footer  (.astro)
    pages/index.astro
```
- **Islands:** interactivity ships as Astro `<script>` client modules (vanilla TS + GSAP/Lenis) — no React unless a section needs reactive state, keeping JS minimal.
- **Deploy:** Vercel (or Netlify); domain + OG/meta + favicon (octagon) + lightweight analytics.

---

## Phased Build Plan — with model + thinking per phase

> **Strategy:** spend the expensive, high-taste reasoning (**Opus 4.8** + high/extended thinking) on the things people *feel* — design system, the two signature scenes, motion feel, and brand voice. Use **Sonnet 4.6** + medium thinking for spec-driven section build-out once patterns exist. Drop to **Haiku 4.5** + low/no thinking for pure boilerplate (installs, config, deploy chores, asset renaming). Switch with `/model`; consider `/fast` on Opus phases for snappier output.

### Phase 1 — Foundation & Design System
**Do:** scaffold Astro + Tailwind v4; install GSAP/ScrollTrigger + Lenis; wire fonts; define color/type/spacing/motion **tokens** in `global.css`; build the global shell (Lenis init, GSAP register, reduced-motion guard, grain, custom cursor primitives); **trace clean SVGs** of cookie, token, and both logo lockups from the PNGs.
**Deliverable:** an empty but styled site that scrolls smoothly, with the design DNA + animatable brand SVGs in place.
- **Model:** **Opus 4.8** — this sets the visual DNA and the SVG-asset architecture that every animation depends on; getting it right is taste- *and* structure-critical.
- **Thinking:** **High.**
- **Downshift:** the raw `npm create astro` / dependency installs / config boilerplate → **Haiku 4.5**, no thinking.

### Phase 2 — Hero "Choose Your Path" (signature interactive #1)
**Do:** floating cookie/token with idle micro-motion + cursor parallax; three hover/click hotzones with reveal panels; custom-cursor morph; click → smooth-scroll; headline/sub/scroll-cue; reduced-motion + keyboard paths; wire it as the nav.
**Deliverable:** a hero that *is* the navigation and immediately signals the concept.
- **Model:** **Opus 4.8** — bespoke interaction design + state + accessibility; first impression, high stakes.
- **Thinking:** **High.**

### Phase 3 — The Collision Scroll Scene (signature moment #2)
**Do:** pinned, scrubbed GSAP timeline; cookie+token converge → overlap → resolve into the logo lockup; parallax depth layers; mobile choreography; reduced-motion static fallback. (Spec above.)
**Deliverable:** the centerpiece that makes people feel the brand.
- **Model:** **Opus 4.8** — the single hardest + highest-value piece; choreography, timing, and feel are make-or-break.
- **Thinking:** **Max / extended ("ultrathink").**

### Phase 4 — Content Sections Build-out
**Do:** build Manifesto, Cookie side, Token side, Overlap/Full-Package, Process, Proof, About, CTA, Footer, sticky Nav — reusing the Phase 1 system and Phase 2–3 motion patterns.
**Deliverable:** the complete one-pager structurally + visually.
- **Model:** **Sonnet 4.6** — fast, capable, pattern-following once the system is set.
- **Thinking:** **Medium.**
- **Upshift:** sections with bespoke animation (interactive Venn in Overlap, pinned horizontal cards, scrubbed Manifesto reveal) → **Opus 4.8**, high thinking.

### Phase 5 — Copy Pass (brand voice)
**Do:** draft all copy in the "AI-supercharged human craft / better outcomes at better value" voice — hero, manifesto, positioning, service descriptions, process, CTA, micro-copy.
**Deliverable:** the site reads as polished and on-brand.
- **Model:** **Opus 4.8** for the voice-defining lines (hero, manifesto, positioning) — this *is* the brand's verbal identity; **Sonnet 4.6** for longer body/service copy once the voice is locked.
- **Thinking:** **High** (voice/positioning) → **Medium** (body).

### Phase 6 — Motion Polish & Micro-interactions
**Do:** tune easings/durations, cursor parallax, hover states, section transitions, scroll-linked accents, WebGL/canvas grain, custom-cursor states. Make it *feel* expensive.
**Deliverable:** cohesive, premium motion across the whole scroll.
- **Model:** **Opus 4.8** — feel/taste tuning is the differentiator at this stage.
- **Thinking:** **High.**
- **Downshift:** repetitive hover/transition wiring → **Sonnet 4.6**, medium.

### Phase 7 — Performance, Accessibility & Responsive QA
**Do:** Lighthouse pass; verify `prefers-reduced-motion` everywhere; keyboard nav + focus states; responsive/mobile choreography for hero + collision; lazy-load + image/SVG optimization; cross-browser check.
**Deliverable:** fast, accessible, solid on phone and desktop.
- **Model:** **Sonnet 4.6** — systematic audit + fixes.
- **Thinking:** **Medium.**
- **Upshift:** stubborn perf regressions in the pinned/WebGL scenes → **Opus 4.8**, high.

### Phase 8 — Deploy & Launch
**Do:** Vercel/Netlify deploy; domain; meta/OG tags; favicon (octagon); analytics; final smoke test on the live URL.
**Deliverable:** a live, shareable sales asset.
- **Model:** **Haiku 4.5** (mechanical), escalate to **Sonnet 4.6** if config gets fiddly.
- **Thinking:** **Low.**

### Model & thinking at a glance
| Phase | Model | Thinking |
|---|---|---|
| 1 Foundation & design system | Opus 4.8 (Haiku for installs) | High |
| 2 Hero "Choose Your Path" | Opus 4.8 | High |
| 3 Collision scroll scene | Opus 4.8 | Max / extended |
| 4 Content sections | Sonnet 4.6 (Opus for bespoke anim) | Medium |
| 5 Copy | Opus 4.8 → Sonnet 4.6 | High → Medium |
| 6 Motion polish | Opus 4.8 | High |
| 7 Perf / a11y / responsive QA | Sonnet 4.6 (Opus for hard perf) | Medium |
| 8 Deploy | Haiku 4.5 → Sonnet 4.6 | Low |

---

## Verification (how we'll know it's working)
- **Run locally:** `npm run dev` → open the local URL; scroll the full page on desktop.
- **Per phase:** confirm the phase's deliverable visually in the browser (and via screenshots) before moving on — Lenis smoothness (P1), hero hover/click → scroll + reduced-motion (P2), the collision pin/scrub resolving onto the logo + mobile + reduced-motion (P3), each section renders + is responsive (P4), copy reads on-brand (P5), motion feels cohesive (P6).
- **Pre-launch:** Lighthouse (perf/a11y/SEO/best-practices) on a production build; keyboard-only walkthrough; `prefers-reduced-motion` toggle test; mobile (real device or emulation); cross-browser (Chrome/Safari/Firefox).
- **Post-deploy:** smoke-test the live URL, OG preview, favicon, and the CTA path.

---

## Open Items (I'll confirm as we build — not blockers)
- **Proof/Work section:** do we have any real case studies / results / client names yet, or should this be outcome-framed ("what good looks like") until we do?
- **About/founders:** names, bios, photos — or stylized placeholders for now?
- **Contact mechanism:** email link, Calendly/Cal.com embed, or a form (needs a form backend)?
- **Domain & host:** is there a domain already, and Vercel vs. Netlify preference?
- **Exact service taxonomy:** I'll draft the Cookie-side and Token-side service lists; you'll refine the real offering.
