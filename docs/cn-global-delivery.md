# CN / Global Delivery

This site keeps one visual system and one build output.

## Current baseline

- Fonts are served locally through the app build.
- KaTeX CSS, JS, and math fonts are served locally through the app build.
- The same `dist/` can be published to more than one origin without changing UI.

## Recommended topology

1. `www.<domain>`
   - Global / overseas entry.
   - Point to the current overseas origin or overseas CDN.

2. `cn.<domain>`
   - Mainland-facing entry.
   - Use only after a filing-ready mainland line is available.
   - Serve the same `dist/` output as `www`.

## Practical notes

- Do not fork the front end into two designs.
- Keep one codebase and one build.
- Split only the delivery layer: DNS, CDN, origin, and cache policy.
- If mainland filing is not ready, keep the public primary entry on the global line.

## Suggested rollout

1. Bind a domain.
2. Keep `www` on the current overseas stack.
3. Prepare a mainland-ready line for `cn` after filing.
4. Publish the same `dist/` to both lines.
