# Carnet right-page correction · 2026-07-16

## Scope

Single-screen combined visual and accessibility-risk audit of the Carnet home spread at the live local preview. The user goal was to understand the right-hand mathematical object without first discovering the hover state.

## Evidence and result

1. `01-before.png` — unhealthy. The Canvas rendered at the expected size, but dormant ink and traces were so faint that the right page read as empty.
2. `02-after.png` — healthy. A persistent ink curvature trace, datum and measurement ribs establish a visible mathematical object without explanatory copy.
3. `04-dwell.png` — healthy. A stationary pointer reveals only the local vermilion reading field; leaving returns progress from `1.000` to `0.000` and the field to `dormant`.
4. `05-mobile.png` — healthy. The mobile-only tree renders one readable trace at 390×844 with zero horizontal overflow.

`03-before-after.png` is the same-size comparison used for visual judgment.

## Limits

Screenshots support hierarchy, contrast-risk and responsive-reflow findings, but do not by themselves establish WCAG contrast ratios. Keyboard focus and semantic labeling remain implemented in the live component and were not altered by this correction.

Final result: passed.
