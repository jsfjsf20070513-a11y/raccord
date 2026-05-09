# Demo Video Script — Dev3pack 2026 Submission

Target length: **under 2 minutes** (ElevenLabs Qualification cap;
Solana track allows up to 3 minutes — we hit the tighter cap so
the same video satisfies both).

Final cut runs **1:58**. Recorded with macOS QuickTime "New Screen
Recording" (selected window + built-in microphone), browser in
full-screen mode, all notification sources silenced. Single take
preferred — pacing artefacts are fine, the video should feel made
by a student, not a marketing team.

| Time | Screen Action | Voice-over |
|---|---|---|
| 0:00–0:08 | Open `rucmathclass.com`. Hero: `2025 级数学班` + "Trente mathématiciens, une classe" + red Dev3pack eyebrow. | "This is Math Class Website — a bilingual class memory for thirty math students. I'm Jin Shuofeng, a freshman at Renmin University of China Sino-French Institute Suzhou. The home page itself announces this is a Dev3pack 2026 Solana plus AI entry." |
| 0:08–0:18 | Click `▶ Écouter`. **Let the ElevenLabs French narration audibly play for ~4 seconds.** Then move cursor toward "→ Open Web3 Student Profile". | *[Live French audio plays]* "That voice is generated with ElevenLabs `multilingual_v2`, the George storyteller — the Generate Speech integration path." |
| 0:18–0:28 | Click `Open Web3 Student Profile`. Land on §01. Click Connect, approve Phantom popup. | "On the Web3 entry, I connect a real Phantom wallet. Devnet only, no mainnet, no money." |
| 0:28–0:40 | Wallet address visible. Move to §02. Click sign — Phantom popup → approve. Show base58 signature. | "Section 02: I sign a bilingual student statement with ed25519. The wallet never exposes my private keys, and the signature is independently verifiable with `@solana/web3.js` verify or tweetnacl." |
| 0:40–0:52 | Move to §03. **Pause briefly on the "letter to the class" — show the pull quote `Anchored, not stored.` on screen.** Click "Anchor on Devnet" (SPL Memo). Phantom popup → confirm. | "Above the on-chain anchor sits a letter to the class — *Anchored, not stored.* Now I anchor via SPL Memo program v2." |
| 0:52–1:02 | Show new tx signature. Click "View on Solscan". Briefly show the successful tx detail. | "Real on-chain write. Memo program `MemoSq4gqAB…mfcHr`. First project anchor was `5L76cFugq…56gv846`, also on devnet — Solscan-verifiable in ten seconds." |
| 1:02–1:18 | Back to §03. Click second button **"Anchor with Class Program"** (custom Anchor program). Phantom popup → confirm. Show new tx Solscan link. | "Now the second anchor path — my custom Rust Anchor program `class_anchor`, written and deployed to devnet for this hackathon. Source lives in `programs/class-anchor`. Same wallet, my own program ID." |
| 1:18–1:32 | Move to §04. Switch to "Class collective" tab. Show registry chips (3+ wallets) + live memo feed. | "Section 04 reads `getSignaturesForAddress` plus `getParsedTransaction` directly from `api.devnet.solana.com`. No third-party indexer. Multiple class wallets, real memos, aggregated by block time." |
| 1:32–1:42 | Return home. Expand a daily theorem (e.g. Bolzano-Weierstrass) — show Chinese + French side-by-side proof. | "Home page also exposes 24 bilingual theorem proofs — Chinese and French side by side, generated with Anthropic Claude, rendered with KaTeX." |
| 1:42–1:50 | Quick scroll past §2 plates real photos (合唱 / 苏博 / 嘉兴). | "Real class photos are injected at deploy time from a private repo, never on GitHub — but live on the production site." |
| 1:50–1:58 | Return to home top or footer. | "Math Class Website. Solo build, AI-assisted, MIT open source. Solana track plus ElevenLabs Generate Speech. Thank you." |

## Pre-recording checklist

- [ ] Custom Anchor program is deployed to devnet, program ID pinned in
      `docs/anchor-program.md`, `IS_ANCHOR_PROGRAM_LIVE` flipped to `true`
      in `src/lib/classAnchorProgram.js`, second §03 button rendered.
- [ ] Three classmate wallets visible in the §04 collective feed
      (paste them into the registry input ahead of recording so they
      are already in localStorage when the camera rolls).
- [ ] Phantom is on Devnet, faucet-funded (≥ 0.05 SOL) so both
      anchor flows succeed without an "insufficient SOL" detour.
- [ ] Browser is full-screen (Cmd+Ctrl+F) with no bookmark bar,
      no Vite dev banner, no Cursor / Slack / WeChat notifications.
- [ ] Audio: laptop external speaker on so the ElevenLabs French
      narration plays *into* the microphone — judges should hear
      the actual `multilingual_v2` voice, not a screen-share echo.

## Where to upload

YouTube **unlisted** (preferred), or Vimeo. Paste the URL into the
Dev3pack submission form at `hack.dev3pack.xyz/member/projects` →
Step 3 "Links & video".
