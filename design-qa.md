# Design QA — 三世界 / Page du jour

- Source visual truth: `/tmp/code-review-package/.thumbnail` and `/tmp/code-review-package/Page du jour.dc.html`
- Implementation screenshot: `/tmp/math-design-qa/limite-implementation.jpg`
- Full-view comparison: `/tmp/math-design-qa/limite-comparison.png`
- Focused comparison: `/tmp/math-design-qa/limite-instruments-comparison.png`
- Viewport: 1280 × 720 desktop; additional responsive check at 390 × 844
- State: Limite world, Page du jour, live dichotomy instrument and meditation typewriter

**Findings**

- No actionable P0/P1/P2 mismatch remains.
- Fonts and typography: Archivo 900, Noto Sans SC, and JetBrains Mono reproduce the source hierarchy and weight. The current theorem is date-driven rather than the fixed Bolzano example in the design document; that content difference is intentional.
- Spacing and layout rhythm: the two-column theorem/instrument split, signal line, panel proportions, and mobile single-column collapse match the source. The production shell adds the required world-specific navigation above the designed page.
- Colors and visual tokens: Limite uses the specified `#100d0b` background, `#ece7dd` ink, `#ff4d2e` sole accent, `#17120f` panels, and translucent bone-white rules.
- Image quality and asset fidelity: this view contains no illustrative or photographic content. Enter uses direct static captures of the supplied PLAN ℝ, Carnet, and Limite sources rather than placeholders.
- Copy and content: labels, bilingual hierarchy, instrument explanation, meditation, edition date, and day number follow the handoff. The theorem and meditation rotate from the existing production data pipeline.

**Open Questions**

- None blocking. Database-backed testimony writes remain gracefully read-only until `setup_testimonials.sql` is applied to Supabase.

**Implementation Checklist**

- [x] Match the three world token sets and typography.
- [x] Keep the Limite instrument and typewriter live.
- [x] Preserve the production daily theorem/proof data.
- [x] Verify desktop and mobile layouts.
- [x] Verify world selection and route scroll restoration.

**Patches Made Since First QA Pass**

- Reduced the entrance hero and preview height for 720px-tall desktop viewports so all three cards and captions remain visible.
- Made Enter full-bleed on mobile despite legacy body gutters and reduced the mobile hero size to prevent clipping.
- Added route-level scroll restoration so selecting a world from a scrolled mobile entrance always opens its page at the top.
- Kept the mobile world switch and authentication actions on one readable row.

**Follow-up Polish**

- No P3 polish is required for handoff.

final result: passed

---

# Design QA — Recueil / Carnet 杂页(第二阶段)

- Source visual truth: `/tmp/code-review-package-2/Recueil.dc.html`, `Login-Carnet.dc.html`, `Pages annexes.dc.html`
- Source acceptance capture: `/tmp/code-review-package-2/scraps/recueil.png`
- Implementation capture: `/tmp/recueil-actual.png`
- Side-by-side comparison: `/tmp/recueil-side-by-side.png`
- Viewports: 1280 × 720, source-matched 924 × 540, mobile 390 × 844
- Pages checked: `/recueil`, `/login`, `/404`, `/reset-password`, `/resources/curate`, route loading overlay

**Findings**

- No actionable P0/P1/P2 mismatch remains.
- Recueil: 24 entries render in the required 10/7/7 volume split; exactly one Shanghai-date entry is highlighted; all 24 formulas use the generated `displayHtml` KaTeX output. Expand/collapse works without a boxed focus treatment.
- Login: primary and secondary controls have transparent backgrounds; mode/method toggles remain horizontal at mobile width; inputs have only a 1px bottom hairline and centered text.
- 404: the 150px EB Garamond numeral, bilingual title, 360px number-line motif, quotation, and three underlined exits match the annex reference. At 390px the number line contracts to 310px without horizontal overflow.
- Loading: the track is 1px, the scanner is 3px × 26%, and the 1.6s motion uses the page accent token. The bilingual phrase is centered and has no left rule.
- Reset and ResourceCurate: state changes and real submission/auth logic remain intact; presentation uses hairline sections and underlined text actions, with no panel boxes.
- Theme propagation: verified the same annex components against Carnet, PLAN ℝ, and Limite tokens. Accent and paper values changed through CSS variables without hardcoded page palettes.
- Browser console: no errors across the audited routes.

**Implementation Checklist**

- [x] Recueil route, Carnet navigation item, and Home theorem-tail entry
- [x] Three volumes, 24 generated theorem records, one daily highlight
- [x] Login zero-grammar toggles, fields, submit action, and destination list
- [x] 404 number-line motif and exact bilingual copy
- [x] Loading hairline scanner and centered rotating copy
- [x] Reset success wording and underlined login link
- [x] Resource curation no-box form grammar
- [x] Desktop and mobile responsive checks
- [x] Cross-world token checks

final result: passed
