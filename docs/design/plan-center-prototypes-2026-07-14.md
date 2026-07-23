# PLAN ℝ center-object prototypes

Date: 2026-07-14  
Status: local development study; no product direction selected.

## Question

Which single mathematical object can make PLAN feel constructed rather than browsed, while preserving the existing restrained engineering-board language?

## Variants

- A — Raccord: adjust one Bézier handle until the join progresses from G⁰ toward C². The readout is derived from first/second derivatives and signed curvature.
- B — Charpente: add or remove diagonals from a four-node plane frame. Rank, mechanisms, and self-stress come from its rigidity matrix.
- C — Composition: stack elementary 2×2 transforms and compare the resulting grid with a target composition. Determinant and residual are calculated from the current matrix.

## Recommendation

Start with A. It has the clearest one-object/one-action/one-afterimage loop, and continuous curvature makes the interaction specific to PLAN without becoming a generic calculator. B is the strongest alternate for structural mathematics. C is useful but reads more like an instrument panel and therefore needs the most restraint.

## Integration boundary

The study is visible only in development through `?variant=A`, `B`, or `C`. With no query the existing PLAN home remains unchanged; production ignores the query. Desktop and mobile use separate composition wrappers over the same pure mathematical core and Canvas renderer.

## Pending verdict

Keep all three reversible until visual review. After selection, absorb one object into PLAN and remove the prototype switcher and rejected variants.
