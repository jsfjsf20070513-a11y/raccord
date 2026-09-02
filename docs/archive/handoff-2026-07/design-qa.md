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

# Design QA — Raccord 01 / 三世界第一版

**Comparison Target**

- Source visual truth: Claude desktop captures for Enter, PLAN, Carnet and Limite at `/tmp/math-enter-design-qa/` and `/tmp/math-worlds-design-qa/`.
- Implementation: current working tree at `http://127.0.0.1:5174/enter`.
- Same-size side-by-side comparisons (source left, current right):
  - `docs/design/audit-2026-07-16/compare-enter-final.jpg`
  - `docs/design/audit-2026-07-16/compare-plan-final.jpg`
  - `docs/design/audit-2026-07-16/compare-carnet-final.jpg`
  - `docs/design/audit-2026-07-16/compare-limite-final.jpg`
- Current mobile captures at `390 × 844`:
  - `docs/design/audit-2026-07-16/qa-enter-mobile-390x844.jpg`
  - `docs/design/audit-2026-07-16/qa-plan-mobile-390x844.jpg`
  - `docs/design/audit-2026-07-16/qa-carnet-mobile-390x844.jpg`
  - `docs/design/audit-2026-07-16/qa-limite-mobile-390x844.jpg`
- Breakpoint evidence: `qa-enter-760.jpg` and `qa-enter-761.jpg` in the same audit directory.
- States checked: Enter dormant/active/leave; PLAN handle drag and arrow adjustment; Carnet local trace and keyboard exploration; Limite pointer load and keyboard Home/End; shared-object persistence between worlds.

**Visible Result**

- Enter keeps the Claude composition and removes the explanatory clutter. Its three posters are now previews of three different material laws rather than screenshots of three unfinished homepages.
- PLAN is an engineering operation: one Bézier handle moves a two-segment curve from a merely joined condition toward a smoother raccord.
- Carnet is an interpretation operation: the same curve becomes a trace between Cauchy continuity and Bergsonian duration; proximity reveals local calibration or residue without turning the page into a dashboard.
- Limite is a stress operation: the same curve enters an A350-inspired reduced-load instrument, where the pointer or keyboard raises λ from stable to threshold.

**Findings and Fix History**

1. The first world pass only repeated a similar curve in three canvases. Fixed by introducing one normalized, persistent `Raccord 01` handle and verifying the exact value `0.646,0.682` in PLAN, Carnet and Limite after editing it in PLAN.
2. PLAN claimed `C²` while reporting `G⁰`. Fixed the display language to `Raccord → C²`: it names the intended construction without misrepresenting the current metric.
3. Carnet retained a faint trace after pointer leave. Fixed by multiplying the trace by the active field and clearing it when the field becomes dormant.
4. Limite was mouse-only. Fixed with a semantic slider and Arrow/Page/Home/End controls; browser checks reached `λ 1.00 / seuil` and returned to `λ 0.00 / stable`.
5. At `320 × 568`, dragging or scrolling over the PLAN canvas could block page travel. The mobile canvas now uses `touch-action: pan-y pinch-zoom`; a real scroll beginning inside the canvas moved the page from `scrollY 0` to `103`.
6. The site body padding exposed a 16px palette seam around full-bleed worlds. The world shell now measures exactly `x=0 / width=viewport`; header and world backgrounds resolve to the same RGB value in all three palettes.
7. The mobile/desktop switch at `760/761` changed composition too abruptly. The tablet mobile line now adopts the desktop title and three-object rhythm: card positions differ by at most 4px and vertical positions by 12px across the one-pixel boundary, with no horizontal overflow.
8. Quiet Enter cards were too dim to read. Their labels remain legible while the active card is distinguished through material response, not hover enlargement.

**Responsive and Accessibility Evidence**

- Exactly one experience DOM is mounted: mobile through `760px`, desktop from `761px`.
- No horizontal overflow at `320`, `390`, `760`, `761`, `1200` or `1280` widths.
- PLAN, Carnet and Limite each expose a full-viewport shell with matching palette at desktop and mobile sizes.
- The Carnet trace has a labelled keyboard group; the Limite instrument exposes numeric range/value text; PLAN retains keyboard handle adjustment.
- Motion remains event-driven and reversible. There are no particles, broad glow, hover scale, cheap glass panels or permanent animation loops.
- A fresh Chrome reload produced only Vite connection and React development info messages; there were no warnings or errors.

**Implementation Boundary**

- The material response is still CSS + Canvas 2D simulation. Paper grain, relief, local light, waveform activation and curve deformation are drawn procedurally; there is no illustration-to-height-map pipeline, normal map, mask texture, shader, WebGL lighting or GPU relief.
- This is intentional for phase one: it validates touch, pacing and world distinction before committing to a WebGL material pipeline.

**Validation**

- `npm run lint -- --no-cache`: passed.
- `npm test -- --run`: 116 tests passed.
- `npm run build`: passed; only the existing chunk-size advisory remains.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `git diff --check`: passed.

## Le ciel de Poincaré · 第一章 · 2026-07-18

- 选定视觉基准：`docs/design/poincare/selected-option-2.png`（方向二：沉睡的几何学家）。
- 最终并排校验：`docs/design/poincare/qa/comparison-desktop-final.jpg`；左侧为参考分镜，右侧为真实浏览器渲染。
- Desktop：1440 × 1024；Mobile：390 × 844。两个断点使用独立组件树，而非同一页面的缩放版。
- 三件实景素材：`public/assets/poincare/plan-relief.png`、`carnet-relief.png`、`limite-relief.png`。

### Findings

- P0（已修复）：Limite 在 Canvas 尚未完成首次 resize 时可能绘制负半径反光弧，热重载后会令场景空白。所有局部反光弧现已钳制到正半径；刷新与双端切换后控制台无运行时错误。
- P1：无未解决项。PLAN 的初值拖动、Carnet 的驻留显影、Limite 的按住加载已经成为三个不同手势，且三者共享同一份持久化对象经历。
- P2：无未解决项。PLAN 曲线改为低噪声锚点插值，保留由真实分离度控制的虚线偏差；Carnet 删除了过密相图，改为纸面记忆线；Limite 保持单一朱红阈值与永久伤痕。
- 字体与配色：标题使用克制的 Garamond 斜体；系统标记使用小号等宽体。PLAN 为骨白/钴蓝，Carnet 为象牙/暗酒红，Limite 为暖黑/朱红；没有大面积 glow、粒子、毛玻璃或 hover 放大。
- 构图：三件物体占据各自全场，文字只保留世界、章节、时间/记忆和通行方向。桌面与移动截图均无可见裁切或横向溢出。
- 数学诚实性：敏感依赖使用确定性的 Rössler 流作为可控原型，并未冒充庞加莱三体问题的精确重建。相邻初值会先靠近、后产生宏观分离；单元测试固定了这一行为。
- 后果：PLAN 提交初值后产生一条跨世界记忆；Carnet 读取最多七条经历；Limite 首次越阈值留下不可逆 scar，后续越界继续计数。
- 运行时：真实浏览器完成 PLAN → Carnet → Limite → PLAN 通行、桌面拖动、Carnet 记忆读取/驻留、Limite 阈值越界与移动端独立树校验。最终控制台仅有 Vite/React 开发信息，无 error。

### Validation

- `npm run lint`: passed.
- `npm test`: 14 files / 135 tests passed（`opsQueue` 的 malformed JSON stderr 为既有拒绝路径测试）。
- `npm run build`: passed；仅保留既有 chunk-size warning。
- `git diff --check`: passed.

final result: passed

---

# Design QA — Raccord 01 共同命运 · 2026-07-16

**Source and current comparison**

- Source baseline: the accepted first CSS + Canvas world pass in `docs/design/audit-2026-07-16/01-enter-desktop.png` through `08-limite-mobile.png`.
- Current implementation: `http://127.0.0.1:5174/enter` in Chrome.
- Same-size desktop comparisons (source left, current right):
  - `docs/design/audit-2026-07-16/fate-loop/compare-enter-desktop.png`
  - `docs/design/audit-2026-07-16/fate-loop/compare-plan-desktop.png`
  - `docs/design/audit-2026-07-16/fate-loop/compare-carnet-desktop.png`
  - `docs/design/audit-2026-07-16/fate-loop/compare-limite-desktop.png`
- Same-size mobile comparisons at `390 × 844`:
  - `docs/design/audit-2026-07-16/fate-loop/compare-enter-mobile.png`
  - `docs/design/audit-2026-07-16/fate-loop/compare-plan-mobile.png`
  - `docs/design/audit-2026-07-16/fate-loop/compare-carnet-mobile.png`
  - `docs/design/audit-2026-07-16/fate-loop/compare-limite-mobile.png`

**Visible result**

- Enter preserves the accepted Claude composition. The metal title now performs one bounded left-to-right awakening sweep, then returns to the pointer-controlled material; pointer input cancels the sweep immediately. The title and the three poster fields were strengthened by roughly one restrained contrast step without adding glow or autonomous looping.
- PLAN is now one construction instrument. The page furniture and instruction copy were reduced, the curve owns the field, and the two metrics form a rail attached to the canvas. Only the exact snapped handle archives a C² completion; tolerant C² grades are not treated as completion.
- Carnet is now a reading surface rather than a second instrument panel. The internal header/footer frame was removed. A still pointer reveals a curvature interpretation after a quiet dwell, while the paper permanently carries the PLAN emboss and the capped Limite scars.
- Limite is now a press-and-hold test. Hover only moves local reflection; it never changes load. Holding raises λ over time, release unloads continuously, and crossing the threshold leaves one idempotent scar plus the historical MAX notch without locking or punishing the object.

**Interaction and fate evidence**

- PLAN drag reached the exact handle `0.660,0.560`, rendered `C² / 0.000`, and persisted after reload. Arrow-key adjustment committed back through the same exact snap path at `320 × 568`.
- Limite hover remained `idle / λ 0.00`. A bounded hold reached threshold, returned to `idle / λ 0.00`, and persisted `max=1.000 / crossings=1` after reload.
- Carnet reported `construction=present / scars=1` at desktop, `390 × 844`, and `320 × 568`, proving that it reads shared object history rather than only the live handle.
- Enter reported `awakening=true` immediately after reload, `false` after 1.32 s, and `false` immediately after pointer movement.
- Chrome reported no console warnings or errors in the final pass.

**Responsive and accessibility evidence**

- Exactly one experience tree is mounted: mobile through `760px`, desktop from `761px`.
- No horizontal overflow at `320`, `390`, `760`, `761`, `1280`, `1440`, or the `1512px` comparison size.
- `320 × 568` intentionally scrolls vertically for the large instruments; no world compresses its object into an unreadable first screen.
- PLAN exposes one labelled keyboard-adjustable curve group; Carnet exposes a labelled keyboard reading field; Limite uses a pressed-button model with Space/Enter semantics and low-frequency regime announcement.
- Reduced-motion CSS removes the Enter sweep and decorative flutter while retaining construction, dwell, loading, unloading, and historical causality.

**Implementation boundary**

- This remains CSS + Canvas 2D simulation. Grid relief, paper fibre, blind emboss, local reflection, deformation, memory traces, and scars are procedural draws.
- There is no illustration-to-height-map pipeline, normal map, mask texture, shader, WebGL light, GPU relief, particle system, broad glow, hover scaling, or glass-panel effect.

**Validation**

- `npm run lint -- --no-cache`: passed.
- `npm test -- --run`: 128 tests passed.
- `npm run build`: passed; only the existing large-chunk advisory remains.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `git diff --check`: passed.

final result: passed

---

# Design QA — 三世界首页内容分家

**Source truth**

- Claude package: `/Users/jinshuopeng/Downloads/代码全面审查 (2).zip`.
- PLAN ℝ: `Home.dc.html`; capture `/tmp/math-worlds-design-qa/plan-source-1200x820.png`.
- Le Carnet: `Carnet v3.dc.html`; capture `/tmp/math-worlds-design-qa/carnet-source-1200x820.png`.
- Limite: `Limite v3.dc.html`; capture `/tmp/math-worlds-design-qa/limite-source-1200x820.png`.
- All source/current desktop comparisons were emitted together in Chrome at `1200 × 820` before judging and patching.

**Implementation evidence**

- PLAN: `/tmp/math-worlds-design-qa/plan-current-1200x820.png`.
- Carnet: `/tmp/math-worlds-design-qa/carnet-current-1200x820.png`.
- Limite: `/tmp/math-worlds-design-qa/limite-current-1200x820.png`.
- Mobile: `plan-mobile-390x844.png`, `carnet-mobile-390x844.png`, `carnet-daily-mobile-390x844.png`, and `limite-mobile-390x844.png` in the same directory.
- Limite states: `limite-dormant-1200x820.png` and `limite-active-1200x820.png`.

**Content separation**

- PLAN ℝ is now the public cover and coordinate index. It contains class identity plus only two exits: Bibliographie and Le Carnet. The rotating theorem was removed from this world.
- Le Carnet is the archive. Its first viewport is the class cover; the current theorem, formula, optional proof notes, Recueil, Témoignages, and meditation live below it as folios rather than as universal homepage furniture.
- Limite is the instrument room. Its homepage contains one convergence instrument plus Vocabulaire and Assistant exits. It no longer duplicates the daily theorem or meditation.

**Visual fidelity and intentional divergence**

- PLAN preserves Claude's bone-white field, cobalt, Archivo 900, hard datum, outlined ℝ, grid, and Swiss poster scale. The boxed four-tab strip was deliberately reduced to a quiet two-item index.
- Carnet preserves ivory paper, oxidized red, EB Garamond, the central datum, hairlines, old-style editorial rhythm, and centered cover. The six-item navigation and explanatory subtitle were removed.
- Limite preserves warm black, vermilion, Archivo 900, mono readouts, central datum, and instrument framing. The automatic Newton sequence and typewriter were replaced with a pointer-controlled symmetric convergence field.
- No new color outside the three established world palettes was introduced.

**Interaction and responsive checks**

- PLAN and Carnet reuse the shared pointer field but retain separate surfaces: local grid calibration for PLAN; central rule/imprint response for Carnet. Both reported `resting` with byte-identical delayed screenshots, then `dormant` after the pointer returned to the header.
- Limite maps pointer position continuously to `n = 0…32` and `|xₙ − x|`. At rest the element reported `data-field-state="resting"`; screenshots taken 420ms apart were byte-identical.
- Limite dormant and active states are visibly distinct; leaving the field eases the signal back to its sleeping readout and reported `dormant` without a perpetual animation.
- Desktop and mobile all reported zero horizontal page overflow. Mobile navigation remains at most three items and scrolls locally if needed.
- A fresh Chrome tab visited all three worlds through the actual Enter buttons with zero console warnings/errors.

**Validation**

- `npm run lint`: passed.
- `npm test -- --run`: 105 tests passed.
- `npx vite build`: passed; only the pre-existing large-chunk warning remains.
- `git diff --check`: passed.

## 三世界视觉精修与双端终验 · 2026-07-13

- 审美基线：桌面《审美偏好》与 Claude 设计包作为构图/字体/发丝线宪法；只删除无价值解释文字，不改掉三世界的性格。
- 最终截图：`/tmp/math-worlds-refinement-qa-2026-07-13/`，包含三世界 Desktop `1440×900`、Mobile `390×844`，以及 PLAN Atlas、Carnet Archives、Limite Vocabulary 桌面内页。
- PLAN：每屏只保留一个 Archivo 900 主标题；首页用三条真实路径代替六个重复入口；Atlas 从 77 条全量卷轴改为 Desktop 单区 master/detail 与 Mobile 单展开分区。`/resources#zone-4` 与 `#zone-6` 已验证直达正确区域。
- Carnet：中文标题实际计算为 Noto Serif SC 400；移除 placeholder 封面、链上技术口号和全页纸条；Desktop 阅读页 sticky，Mobile 档案点选后会连续、可减少动效地回到读区。
- Limite：大标题收到 Archivo 500/600，朱红只留给活性信号和当前状态；首页只留 `Continuer / Diagnostiquer`，Vocabulary 登录 gate 精简为一句，Assistant 模式增加 `aria-pressed`，双端均为独立 DOM。
- Enter：不改 Claude 构图，仅提高引力网格局部位移、环线与点位吸附强度。真实 Chrome 采样为 `resting/active=1`；离开后三张器物均为 `dormant/active=0`，没有永续 RAF。
- 双端是分别挂载的 component tree，不是同一 DOM 媒体查询压缩；共享只保留 tokens、domain data、SRS/API 与 material primitives。上述页面在对应视口下均为 `scrollWidth === innerWidth`。
- 现阶段仍是 CSS + Canvas 2D 材质模拟：有 proximity field、纸纤维、压印、局部反光和波形通电，但没有 normal map、mask texture、shader 或 WebGL relief。

**Final validation**

- `npm run lint -- --no-cache`: passed.
- `npm test -- --run`: 108 tests passed.
- `npm run build`: passed；`index.css` 668.36 kB，仅保留既有 chunk-size warning。
- `git diff --check`: passed.

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

---

# Design QA — Enter / Claude 精简重构

**Comparison Target**

- Source visual truth: Claude Enter implementation at detached `HEAD d683054`, rendered at `http://127.0.0.1:5174/enter`.
- Exact source values: `Enter.dc.html` in `/Users/jinshuopeng/Downloads/代码全面审查 (2).zip` (Archivo 900, `15vw / .84 / -.03em`, 42px field, and `#57544d → #e9e7dc` text sheen).
- Source capture: `/tmp/math-enter-design-qa/reference-idle-1280x720.png`.
- Implementation: current working tree at `http://127.0.0.1:5173/enter`.
- Implementation captures:
  - `/tmp/math-enter-design-qa/implementation-idle-1280x720.png`
  - `/tmp/math-enter-design-qa/implementation-plan-1280x720.png`
  - `/tmp/math-enter-design-qa/implementation-carnet-1280x720.png`
  - `/tmp/math-enter-design-qa/implementation-limite-1280x720.png`
  - `/tmp/math-enter-design-qa/implementation-mobile-390x844.png`
- Viewports: desktop `1280 × 720`; mobile `390 × 844`.
- States: idle gravity field, PLAN, Carnet, Limite, mobile scroll.

**Full-view Comparison Evidence**

- The Claude composition is preserved: black full-viewport coordinate field, left-aligned two-line display title, three 300px portal posters in a bottom row, and compact corner masthead.
- The deliberate copy reduction removes the source eyebrow, `读 / 做 / 看`, card descriptions, action labels, and footer instruction without changing the primary hierarchy.
- The rejected homepage screenshots are intentionally not a fidelity target. The user required three new cover specimens under the existing CSS + Canvas constraint.

**Focused-region Comparison Evidence**

- Portal row: the source and implementation both use three equal 300px specimens with hairline borders and a number/name label below. Active-state captures verify each replacement poster at readable scale.
- Coordinate field: the implementation retains the source 42px-class grid rhythm and adds a bounded elliptical gravitational well at the pointer without particles or glow.
- Active states: PLAN preserves cobalt engineering paper; Carnet preserves ivory paper and wine-red ink; Limite preserves the dark field, vermilion signal, and optical lens.

**Findings**

- No remaining P0/P1/P2 mismatch.
- The final Chrome pass compared source and implementation in the same browser tab at `1280 × 720`. The idle title computed at Archivo 900 / 145.92px / 122.57px / -4.38px, matching Claude's 900 / 147.2px / 123.65px / -4.42px within responsive rounding.
- Two screenshots taken 420ms apart after the pointer settled were byte-identical. The stage reported `data-field-state="resting"`, confirming that the field and title sheen stop when the pointer stops.

**Required Fidelity Surfaces**

- Fonts and typography: Archivo 900 display face, mono masthead, exact tight tracking, two-line wrap, and 800-weight portal labels preserve the source hierarchy. The idle sheen uses Claude's exact five-stop palette but is pointer-positioned instead of autonomously looping.
- Spacing and layout rhythm: desktop title remains in the left field; portals are 300px wide and evenly distributed; mobile collapses to a single centered column with no horizontal overflow.
- Colors and visual tokens: source black/stone idle palette and the established cobalt, wine red, and vermilion world accents are retained.
- Image quality and asset fidelity: source homepage screenshots were explicitly rejected by the user. Replacement covers are crisp resolution-independent CSS + Canvas specimens, an intentional product constraint rather than an approximation of the removed images.
- Copy and content: visible prose is reduced to `Carnet de classe`, `MMXXVI`, the three world names, numbers, and mathematical marks. `/enter` also skips the global prose loading overlay.

**Comparison History**

1. Initial implementation was incorrectly overridden by legacy Enter CSS, producing a warm centered page and 357px cards (P1). Fixed with an isolated high-specificity Enter stylesheet; post-fix capture restored the black field and Claude composition.
2. The first restored pass kept the title centered and portals wider than the 300px source (P2). Fixed by restoring row-direction hero alignment and capping each portal at 300px.
3. Mobile first load displayed the global narrative loading overlay (P2). Fixed by skipping that overlay only on `/enter`; subsequent DOM evidence showed `loading: false` and no horizontal overflow.
4. Mobile scrolling could leave a stale PLAN stage while all pointer fields were dormant (P2). Fixed by clearing the active world through an id-aware reversible state transition; post-fix evidence showed `active: idle` and all three fields `dormant`.
5. The first refactor pass made the idle title too light and lost Claude's metallic sheen (P2). Re-read the latest Downloads source package and restored Archivo 900, the source line-height/tracking, 800-weight portal labels, and the exact sheen colors. The sweep is now pointer-driven to satisfy the no-autoplay material constraint.

**Implementation Checklist**

- [x] Preserve Claude's black coordinate-paper stage.
- [x] Preserve event-driven gravitational deformation and stop frames at rest.
- [x] Remove nonessential visible prose.
- [x] Replace homepage screenshots with three independent world covers.
- [x] Verify three active visual languages and mobile scroll isolation.
- [x] Pass lint, 105 tests, production build, and diff checks.

**Follow-up Polish**

- Judge the Carnet trail strength by touch in the live preview before changing its opacity.

final result: passed
# Enter 双端分线 · 2026-07-12

- 基线与 Claude 对照：`/tmp/math-worlds-audit-2026-07-12/`（current-run）。
- Desktop：独立 `EnterDesktop` 挂载；1280×720 实测无滚动溢出，主标题与三件器物全部进入首屏，低高度视口保留底部呼吸。
- Mobile：独立 `EnterMobile` 挂载；Chrome 390×844 实测 `scrollWidth=390`、无横向溢出，标题完整，首屏看到第一件完整器物并露出第二件，整页高度 1225px。
- 触控：非 mouse pointer 仅在按压期间更新 field，`pointerup/cancel/scroll` 进入 sleep；桌面 mouse 继续 proximity 响应。
- 仍为 CSS + Canvas 模拟，不是真 normal map/WebGL relief。

## 三世界 Home 双端分线 · 2026-07-13

- current-run 截图：`/tmp/math-worlds-home-qa-2026-07-13/`。
- Desktop 1440×900：PLAN 首屏为公开工程图；Carnet 为左右双页且整页约一个视口；Limite 为仪器和两个工作站。三页 `scrollWidth=1440`。
- Mobile 390×844：PLAN 独立 `PLAN / ℝ` 构图；Carnet 单页 folio 后接记忆页；Limite 仪器与工作站顺排。三页 `scrollWidth=390`。
- 页面仅挂载对应体验线：`plan-world-desktop/mobile`、`carnet-world-desktop/mobile`、`limite-world-desktop/mobile` 已在真实 DOM 验证。
- Limite Assistant 已拆分 desktop/mobile view；移动 gate 经修正后 `scrollWidth=390`，不再使用 emoji、圆角聊天气泡或嵌套 thread 滚动，并增加 Guider/Expliquer/Vérifier 模式与请求中止能力。

## Vocabulary 双端与流程 · 2026-07-13

- 双端壳层：`VocabularyDesktopShell` / `VocabularyMobileShell`；移动 Chrome 390×844 实测 `scrollWidth=390`，标题、导航和登录 gate 无裁切。
- 首次进入不再直接灌入最长 48 张预习：先显示 Calibration，再由用户开始；预习列表只取 queue 中 `isNew=true` 的词，复习词直接进入测试。
- 四入口：`À faire / Faiblesses / Mathématiques / Libre`。弱项入口只取到期复习词；184 个细标签移入 Libre 的原生 select，不再平铺成 chips。
- 设置、乱序、进度导入导出进入折叠设置；答错后提供带当前词与用户答案上下文的 Assistant 解释入口。
- 纯函数验证：`vocabularySession.test.js` 覆盖只预习新词、弱项队列不混入新词和时长估算。

## 世界内部页双端分线 · 2026-07-13

- PLAN `/resources`：Desktop 为左侧坐标索引 + 右侧 Atlas 区域；Mobile 为 8 个原生 `details` 渐进展开。真实目录为 8 zones / 77 repères，Chrome 实测 `1440×900` 与 `390×844` 均无横向溢出。
- PLAN `/resources/curate`：重构为 Chantier 工程表；未登录的桌面与移动 gate 均已实测，登录后的提交仍复用原 `submitOpsSubmission`、审核队列和 RLS 边界，没有修改数据协议。
- Carnet `/recueil`：Desktop 为目录 + 单条阅读页，Mobile 为单条 folio + 三卷展开。24 条定理切换、今日定位、KaTeX 公式均保留；桌面/移动分别点击 N°01 后标题正确切换为 `Bolzano-Weierstrass`。
- Carnet `/testimonials`：Registre 调整为先读档案、后写寄语；Desktop 为账册 + 粘附写入栏，Mobile 为纵向账册后接写入区。真实 6 条历史内容均渲染；本地 Supabase 不可用时按既有策略只读降级。
- 直接访问 `/resources*`、`/recueil`、`/testimonials`、`/vocabulary`、`/assistant` 会自动归入各自世界，不再继承上一个世界的错误 shell。
- 移动世界导航触控高度由 35px 修正为 44px；Archives 卷标题为 45px，定理按钮为 48px。
- Enter proximity field 实测：静止后 `data-field-state=resting` 且两次采样的坐标/强度完全一致；pointer 离开后 `active=0`、`proximity=0`、`data-field-state=dormant`。
- 当前 relief 仍是 CSS + Canvas 2D 材质模拟；没有 normal map、mask pipeline、shader 或 WebGL 光照。

**Validation**

- `npm run lint -- --no-cache`: passed.
- `npm test -- --run`: 108 tests passed.
- `npm run build`: passed；仅保留既有 chunk-size warning。
- `git diff --check`: passed.

## Le ciel de Poincaré · 跨世界连续性 · 2026-07-19

- Source visual truth: `docs/design/poincare/selected-option-2.png`（方向二：沉睡的几何学家）。
- Implementation screenshots: `docs/design/poincare/qa/continuity-plan-desktop.png`、`continuity-carnet-desktop.png`、`continuity-limite-desktop-pass2.png`。
- Full-view comparison evidence: `docs/design/poincare/qa/comparison-continuity-final.jpg`（左为参考三联画，右为同一 seed / scar 状态下的浏览器实景）。
- Focused region comparison: 未另做；最终 1440px 宽并排图中，初值点、两条轨迹、scar、标题字形与材质边缘均已达到可读尺寸。过场是参考图之外的新机制，另以 `continuity-passage-desktop-pass3.png` 和 `continuity-passage-mobile.png` 做运行态证据。
- Viewports: Desktop 1440 × 1024；Mobile 390 × 844。
- State: seed `0.510,0.503`；memory `03`；scar `present`；Limite loading `t≈0.40`。

**Findings**

- 无未解决 P0/P1/P2。
- 字体与文案：沿用参考中的 EB Garamond 斜体标题和小号 JetBrains Mono 计量；没有新增解释段落、人物台词或教程标签。
- 间距与构图：桌面和移动继续使用独立 DOM 树；三幕主体仍占满各自舞台。过场 Canvas 只位于站点 header 下方，不遮挡品牌与世界切换出口。
- 色彩：对象在通行时只在钴蓝、暗酒红、朱红之间连续插值；没有添加第二强调色、光晕、粒子或整屏遮罩。
- 图像：三件既有实景 relief 素材未替换、未拉伸，也没有用 CSS/SVG 伪造新资产；过场只绘制同一数学轨迹和状态标记。
- 连续证据：三幕真实 DOM 的 `data-seed` 均为 `0.510,0.503`；Limite scar 回到 PLAN/Carnet 后仍为 `present`，并以各自材质中的切口显示。
- 交互：PLAN → Carnet → Limite → PLAN 桌面和移动均跑通；过场存在时原场景 Canvas 暂时沉睡，避免双曲线叠影，结束后新场景接管。
- 运行时：最终浏览器控制台无 warning/error；移动端只挂载 `.site-layout-mobile`，桌面端只挂载 `.site-layout-desktop`。

**Comparison History**

- [P2] 第一版过场让目标场景曲线与通行曲线同时出现，形成双重初值点。修复：通行期间将场景 Canvas 置为 dormant，仅保留真实材质与过场中的共享对象；`continuity-passage-desktop-pass2.png` 起不再叠影。
- [P2] Limite 初版直接绘制 121 个动力系统采样点，出现高频尖峰。修复：改用与 PLAN/Carnet 同源的 9 点 signature、二次曲线插值和进度裁剪；`continuity-limite-desktop-pass2.png` 恢复连续曲率与低噪声。
- [P2] 固定位置的过场起点无法与移动后的 PLAN seed 对齐。修复：过场几何现在在 source/target 两界的真实坐标、振幅和阈值位置之间连续插值；移动端 `continuity-passage-mobile.png` 中点与最终 PLAN 初值位置连续。

**Implementation Checklist**

- [x] 一个规范化 signature 驱动三界，不再各自采样相似曲线。
- [x] seed、origin mark、scar 在三界持续可见。
- [x] 世界切换具有有限、可逆、低噪声过场；reduced-motion 直接完成通行。
- [x] 桌面与移动独立实现并完成真实交互校验。
- [x] lint、136 tests、production build 与 diff check 通过。

**Follow-up Polish**

- P3：Limite relief 仍比参考更接近天体曲面而非机翼试件；属于现有 raster asset 的造型差异，本轮不重新生成素材。

final result: passed
