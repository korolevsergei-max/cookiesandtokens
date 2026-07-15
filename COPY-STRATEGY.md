# Cookies & Tokens — Copy Strategy of Record (Growth-Led)

**Supersedes the three-pillar strategy of June 2026.** That document positioned the studio as "one studio for the brand, the growth, and the build" with three parallel service lines and a human plus AI co-lead story. Prospect feedback killed it: buyers could not tell what the company does, and the software offer (custom SaaS, internal tools, AI agents) read as back office work that contradicted the consumer marketing story.

This document is the single source of truth for site copy. Section 5 is the shipping copy deck, keyed to exact files and fields.

---

## 1. The positioning

**Promise (one read):** We grow restaurants, retail, and consumer brands. Built by operators who have run them from the inside.

**Message stack, in priority order:**
1. **Who it is for:** restaurants and hospitality, multi unit retail, consumer and ecommerce brands.
2. **Why us:** we owned the P&L, ran the stores, grew digital revenue tenfold, built the loyalty programs. By operators, for operators.
3. **How:** three levers run as one engine. Brand and creative. Growth channels. The digital experience where customers buy.
4. **Speed (background texture):** operator judgment with AI underneath, so the work ships in weeks. One beat, late in the page.

**Hard rules:**
- AI appears exactly twice on the homepage: the Collision beat (name story) and the footer flavor line. Nowhere else, including chips and tags.
- Nothing on the page a restaurant COO would not buy. Zero back office material: no SaaS, no internal tools, no AI agents.
- Homepage total ≤1,100 words. No sub over 30 words. Every section skimmable from eyebrow plus headline plus card titles.
- Voice: no em dashes, no hyphens in prose or labels ("Tier One", "Omni Channel", "Multi location", "plant based"), no agency filler, concrete commercial nouns over slogans. Operator nouns preferred: covers, store visits, repeat orders, list growth, cost per order.

## 2. Scorecard — old copy under the new lens

| Category | Old | What good looks like |
|---|---|---|
| Positioning clarity | 3/10 | One promise in one read; everything else is a lever of it. |
| Audience specificity | 4/10 | Buyer named in the hero headline. |
| Outcome clarity | 4/10 | Operator nouns, not capability nouns. |
| Differentiation | 5/10 | "By operators, for operators" leads; AI is one speed beat. |
| Proof leverage | 3/10 | Operator Dossier is the second thing a visitor sees. |
| Offer coherence | 3/10 | Every card answers "how does this grow a consumer business". |
| Concision | 3/10 | ≤1,100 words, no sub over 30. |
| Narrative order | 3/10 | Promise → operators → levers → receipts → name story → ask. |
| CTA strength | 5/10 | Operator ask plus response promise. |
| Voice | 8/10 | Keep the voice; cut the volume. |

Quoted lines that failed the new lens: "One studio for the brand, the growth, and the build" (three parallel lines, no buyer); "Custom Software & SaaS … internal tools, integrations, and full SaaS products" (back office, killed the consumer story); "AI Agents & Automation … support, ops, research, reporting" (same); "The cookie is the human" as the second section of the page (model before promise); "For teams that want all of it" style audience lines (name no one).

## 3. Narrative arc (section order in index.astro)

1. **Hero** — the promise, buyer named. 2. **Industries / Operator Dossier** — who you are hiring, with numbers. 3. **CookieSide** — the umbrella: three levers, one engine. 4. **Creative** — lever 01. 5. **Growth channels** — lever 02. 6. **Digital experience** — lever 03. 7. **Selected Work** — receipts. 8. **Collision** — the name story, the one AI beat. 9. **About** — the humans, brief. 10. **CTA** — the ask.

All anchor IDs frozen: `#hero #industries #cookie #creative #growth #software #work #collision #about #cta`.

## 4. Word budget

Hero 80 (incl. hover captions) · Dossier 170 · CookieSide 80 · Creative 110 · Growth 125 · Software 110 · Work 210 · Collision 55 · About 90 · CTA 40 · Footer 35 ≈ **1,090 words**.

---

## 5. Copy deck — every shipping string

### 5.1 Hero — `src/components/Hero.astro`

- Eyebrow: `Cookies & Tokens`
- Headline (accent span on last phrase): `We grow restaurants, retail, and` / **`consumer brands.`**
- Sub: `Run by operators who have owned the P&L and grown the number. One senior team turns your brand, your channels, and your digital experience into one growth engine.`
- Default caption title: `By operators, for operators.` · desc: `Hover a shape to explore, or scroll to see it all.`
- Paths:
  - cookie → `#cookie` · eyebrow `The Cookie` · title `What We Run` · desc `Brand, channels, and digital. Three levers, one engine.`
  - venn → `#collision` · eyebrow `The Overlap` · title `Why the Name` · desc `Operator taste, machine speed.`
  - token → `#software` · eyebrow `The Token` · title `What We Build` · desc `Websites, apps, and the funnels they feed.` (fixes the dead `#token` target)
- Scroll cue: label `Scroll`, target `#industries` (both href and JS).

### 5.2 Operator Dossier — `src/components/Industries.astro`

- Eyebrow: `The Operators`
- Headline: `We've run these from the inside.` (unchanged, accent on `inside.`)
- File 01 `Restaurants & Hospitality` — lead: `We've owned the P&L in multi unit food and beverage. We know where the margin leaks and where digital compounds.` Proof steps and chips unchanged.
- File 02 `Omni Channel Retail` (hyphen removed) — lead: `We've run the stores, not just marketed them. We know how to grow revenue without torching the ad budget.` Proof steps and chips unchanged.
- ctaLine: `This is who runs your account. Let's talk.`

### 5.3 The umbrella — `src/components/CookieSide.astro`

- Eyebrow: `What We Do`
- Headline: `Three levers.` / accent `One engine.`
- Sub: `Brand, channels, and the digital experience where customers buy. Not three services. Three levers on the same number, pulled by one senior team.`
- Cards:
  - `01 Creative` — `A brand that does some of the selling. Positioning, identity, and content built to convert.` tags: Brand, Identity, Content, Positioning → `#creative`
  - `02 Growth Channels` — `Owned, earned, paid, and real world, run as one engine. Budget goes where the return is.` tags: Paid Media, Lifecycle, Experiential, Organic → `#growth`
  - `03 Digital Experience` — `Websites, apps, and funnels where browsers become buyers. Built, then optimized.` tags: Websites, Web Apps, Mobile, CRO → `#software`

### 5.4 Lever 01 Creative — `creative` const in `src/pages/index.astro`

- eyebrow: `Growth Lever 01 / Brand` (now rendered)
- titleLead `Creative that pulls` · titleAccent `its weight.`
- sub: `A recognizable brand does some of the selling and lowers your cost per customer. Senior creatives set the direction and every piece earns its keep.`
- Cards (titles unchanged, icon slugs safe):
  - `Brand & Identity` — `Positioning, naming, and a visual system that makes you recognizable and hard to copy. Recognition is cheaper than reach.` tags: Strategy, Naming, Visual Identity, Guidelines
  - `Content & Copy` — `Copy and content built as a system, so the voice holds across every menu, feed, and shelf.` tags: Copywriting, Social, Content Systems, Production
  - `Creative Strategy` — `The thinking before the making. What to say, to whom, and in what order, decided before a dollar is spent.` tags: Positioning, Messaging, Concepts, Direction
  - `Design & Production` — `Campaigns and collateral from concept to delivery, at the volume your channels actually need.` tags: Campaigns, Art Direction, Assets, Always On

### 5.5 Lever 02 Growth — `growth` const in `src/pages/index.astro`

- eyebrow: `Growth Lever 02 / Channels`
- titleLead `Growth across every` · titleAccent `channel that pays.` (unchanged)
- sub: `Owned, earned, paid, and real world, run as one engine. We test fast, cut what fails, and put budget behind what compounds.`
- Cards (titles unchanged):
  - `Organic & Community` — `The compounding channels most agencies skip. Community, local, and partnerships that build an audience before you spend on media.` tags unchanged
  - `Email & Lifecycle` — `The channel you own. Lists and flows that turn one time buyers into repeat orders.` tags unchanged
  - `Experiential & Activations` — `Launches, pop ups, and field activations engineered to capture content, grow the list, and feed the paid loop.` tags unchanged
  - `Paid Media` — `Google Ads and paid social, planned and managed for our clients. We run the tests and put spend where the return is.` tags unchanged (Google Ads on behalf of clients disclosure preserved)

### 5.6 Lever 03 Digital Experience — `software` const in `src/pages/index.astro`

- eyebrow: `Growth Lever 03 / Digital Experience`
- titleLead `Where browsers` · titleAccent `become buyers.`
- sub: `The websites, apps, and funnels where your growth converts. Senior engineers build them, then keep optimizing until the numbers move.`
- Cards:
  - `Websites & Ecommerce` — `Marketing sites and online stores built to convert. Fast, on brand, and measured.` tags: Marketing Sites, Online Stores, SEO, Performance
  - `Web Apps` — `Ordering, booking, loyalty, and member portals. Full applications, front to back, engineered to scale.` tags: Frontend, Backend, Dashboards, Integrations
  - `Mobile Apps` — `Native iOS and Android, or cross platform when it fits. From first build to the app store.` tags: iOS, Android, Cross Platform, App Store
  - `Experience Optimization` — `Onboarding, funnels, and checkout, improved release by release. We find where customers drop off and fix it.` tags: Onboarding, Funnels, CRO, A/B Testing
- `ServiceIcon.astro`: add glyphs for `websites-ecommerce` and `experience-optimization`; delete `custom-software-saas` and `ai-agents-automation`.

### 5.7 Selected Work — `SelectedWork.astro`, `CaseStudyGroup.astro`, `src/data/caseStudies.ts`

- Intro headline unchanged. Intro sub: `The context, the calls we made, and what moved.`
- Group header: `{number} / Proof` (was `/ What we do`)
- Case study: title and metrics unchanged. Summary: `A plant based restaurant chain needed its paid channels to work as one growth engine, not a pile of disconnected campaigns.`
- Step bodies (trimmed, numbers intact):
  - Context: `The chain wanted more traffic and more paid orders at better efficiency. Search, social, and display each needed a clear role and a faster feedback loop.` tags: Multi location, Paid acquisition, Digital ordering
  - Approach: `We tested channel allocation, creative, copy, and keywords, then moved budget toward what worked. Search expanded into unbranded and competitor terms.`
  - Outcome: `Average CPC fell from $0.95 in week one to $0.40 by week ten. Unbranded traffic rose 27% with CPC down 10%. Competitor traffic rose 18% with CPC down 31%.`
- Disclosure unchanged.

### 5.8 The name story — `src/components/CollisionScene.astro`

- Eyebrow: `The Name` (was `Manifesto`)
- Labels: `Operator` · `AI` · `= Growth` (were Human · AI · = More)
- Headline: `Why we're called Cookies & Tokens.` (unchanged)
- Sub: `The cookie is the operator. Years of running the real thing, and the judgment to know what is actually good. The token is the AI underneath. Speed and range. The operator makes the calls. That is why the work ships in weeks, not quarters.`

### 5.9 About — `src/components/About.astro`

- Eyebrow `About` · headline `The humans.` (unchanged)
- Lead: `We are operators, marketers, and engineers who spent years growing consumer businesses from the inside. Now we do it for clients.`
- Second intro paragraph: cut (covered by Collision).
- Pedigree text: `Senior specialists, not juniors. The backgrounds on your account:`
- Credential chips: `P&L Ownership`, `Organic Growth`, `Tier One Strategy`, `Brand & Creative`, `Software Engineering` (drops Applied AI, adds P&L Ownership)
- Beliefs (5 → 3): `We understand the problem before we touch the solution.` · `We never ship anything we would not put our name on.` · `You get the people who run the studio, not juniors on your account.`

### 5.10 CTA — `src/components/CTA.astro`

- Eyebrow `Let's Talk` · headline `Let's bake something.` (unchanged)
- Sub: `Tell us what you're running and where growth is stuck. A managing director reads every message and replies, usually same day.`
- Button: `Tell us what you're running`

### 5.11 Nav + Footer — `Nav.astro`, `Footer.astro`

- Nav links, new scroll order: `Operators #industries` · `Creative #creative` · `Growth #growth` · `Digital #software` · `Work #work` · `About #about`. CTA `Work with us` unchanged.
- Footer links mirror nav plus `Work with us #cta`. Legal links unchanged.
- Footer tagline: `Growth for consumer businesses, run by operators.`
- Bottom flavor line `Made by humans and machines.` stays (second and last AI beat).

### 5.12 Meta + pages — `BaseLayout.astro`, `contact.astro`, `privacy.astro`, `terms.astro`

- Default title: `Cookies & Tokens | Growth for restaurants, retail, and consumer brands`
- Default description: `We grow restaurants, retail, and consumer brands. Operators who have owned the P&L run your brand, your channels, and your digital experience as one growth engine.`
- Contact description: `Get in touch with Cookies & Tokens, the growth studio for restaurants, retail, and consumer brands.`
- Contact "What we do": `Cookies & Tokens grows restaurants, retail, and consumer brands. One senior team of operators runs the brand, the channels, and the digital experience as one growth engine. As part of our growth work, we plan and manage paid advertising campaigns, including Google Ads, on behalf of our clients, and we build the reporting tools that sit on top of them.`
- Privacy: the section "Advertising platforms and the Google Ads API" is compliance language and must remain intact. Only reconcile the self description ("a creative, growth, and software studio" → "a growth studio for consumer businesses") outside that section.
- Terms: update the services description phrasing if it names the old three pillar framing; no structural change.
