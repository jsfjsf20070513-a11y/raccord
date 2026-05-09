# Demo Video Script — Dev3pack 2026 Submission

Target length: **under 2 minutes** (ElevenLabs Qualification cap;
Solana track allows up to 3 minutes — we hit the tighter cap so the
same video satisfies both). Final cut runs **1:58 / ~259 words**,
which lands at ~145 words-per-minute — a comfortable pace for a
non-native speaker reading without hurry.

Recorded with macOS QuickTime "New Screen Recording" — selected
Chrome window (NOT full-screen, so Phantom popups stay in frame),
built-in microphone, laptop external speaker on so the ElevenLabs
French narration plays into the mic. All notification sources
silenced via Focus mode. Single take preferred; pacing artefacts
are fine — the video should feel made by a student, not a
marketing team.

## Time-coded shot list

| Time | Screen action | Voice-over |
|---|---|---|
| 0:00–0:08 | Open `rucmathclass.com`. Hero: `2025 级数学班` + "Trente mathématiciens" + red Dev3pack eyebrow line. | "This is Math Class Website. A bilingual class memory for thirty math students. I built this solo for Dev3pack 2026 — Solana plus AI." |
| 0:08–0:12 | Click `▶ Écouter`. **Let the ElevenLabs French narration play. Do NOT speak over it.** | *[Live French audio plays for ~4 seconds]* |
| 0:12–0:18 | Move cursor toward "→ Open Web3 Student Profile (Solana devnet)". | "That voice was generated with ElevenLabs `multilingual_v2`. The Generate Speech path, George voice." |
| 0:18–0:28 | Click → land on `/web3-profile`. §01: click Connect. Phantom popup appears → Approve. | "Now to the Web3 entry. Section 1 — connect a real Phantom wallet. Devnet only, no mainnet, no money." |
| 0:28–0:40 | Wallet connected. Scroll to §02. Click Sign with wallet. Phantom popup → Approve. Show base58 signature. | "Section 2 — sign a bilingual student statement with `ed25519`. The wallet never exposes private keys. Anyone can verify the signature with `web3.js` or `tweetnacl`." |
| 0:40–0:52 | Scroll to §03. **Hold the cursor on `Anchored, not stored.` for one beat.** Then click "Anchor on Devnet". Phantom popup → Confirm. | "Section 3 — above the anchor button sits a letter to the class. *Anchored, not stored.* Now I anchor a memo via SPL Memo program v2 on devnet." |
| 0:52–1:02 | Show new tx signature. Click "View on Solscan". 1-second pause showing the Confirmed transaction. Back to §03. | "Real on-chain write. Memo program `MemoSq4gqAB`. The first project anchor was tx `5L76cFugq` — verifiable on Solscan in ten seconds." |
| 1:02–1:22 | Scroll to §04. Click **Class collective** tab. Wait 1s for RPC. **Stop on the Zhu Laiyi PDA row.** | "Section 4 reads both anchor paths from devnet RPC. Look at this entry — *I love Zhu Laiyi's mathematical analysis class*. Zhu Laiyi is a real professor on our class schedule. A classmate wrote that to Solana — permanent. No one can take it back. **Anchored, not stored.**" |
| 1:22–1:38 | Scroll back to §03. Click "Try class_anchor on /witness →". Page navigates to `/witness`. Stop on the program ID + Anchor 0.29 stat panel. | "And here's my custom Rust Anchor program — program ID `Cmv8`. Source in 82 lines of Rust. Each call mints a unique PDA. Read-back via `program.account.classAnchor` — no third-party indexer." |
| 1:38–1:48 | Return home. Scroll to the daily theorem. Click "Voir la preuve · 查看证明思路" to expand the bilingual proof. | "Home page also exposes 24 bilingual theorem proofs — Chinese and French side by side, generated with Anthropic Claude, rendered with KaTeX." |
| 1:48–1:58 | Scroll to footer. | "Math Class Website. Solo build, AI-assisted, MIT open source. Solana track plus ElevenLabs Generate Speech. Thank you." |

## Continuous voice-over (read this top-to-bottom in one take)

```
[0:00, hero]
This is Math Class Website. A bilingual class memory for thirty
math students. I built this solo for Dev3pack 2026 — Solana plus
AI.

[0:08, click ▶ Écouter — DO NOT SPEAK over the French audio]

[0:12, move cursor toward Web3 Student Profile link]
That voice was generated with ElevenLabs multilingual v2. The
Generate Speech path, George voice.

[0:18, click → /web3-profile, §01 Connect]
Now to the Web3 entry. Section 1 — connect a real Phantom wallet.
Devnet only, no mainnet, no money.

[0:28, scroll to §02, click Sign]
Section 2 — sign a bilingual student statement with ed25519. The
wallet never exposes private keys. Anyone can verify the signature
with web3 dot js or tweetnacl.

[0:40, scroll to §03, pause on "Anchored, not stored.", click Anchor]
Section 3 — above the anchor button sits a letter to the class.
Anchored, not stored. Now I anchor a memo via SPL Memo program v2
on devnet.

[0:52, click Solscan link, brief pause]
Real on-chain write. Memo program MemoSq4gqAB. The first project
anchor was tx 5L76cFugq — verifiable on Solscan in ten seconds.

[1:02, switch to Class collective tab, stop on Zhu Laiyi PDA]
Section 4 reads both anchor paths from devnet RPC. Look at this
entry — I love Zhu Laiyi's mathematical analysis class. Zhu Laiyi
is a real professor on our class schedule. A classmate wrote that
to Solana — permanent. No one can take it back. Anchored, not
stored.

[1:22, click Try class_anchor on /witness, land on /witness]
And here's my custom Rust Anchor program — program ID Cmv8. Source
in 82 lines of Rust. Each call mints a unique PDA. Read-back via
program dot account dot classAnchor — no third-party indexer.

[1:38, home page, expand a daily theorem]
Home page also exposes 24 bilingual theorem proofs — Chinese and
French side by side, generated with Anthropic Claude, rendered with
KaTeX.

[1:48, scroll to footer]
Math Class Website. Solo build, AI-assisted, MIT open source.
Solana track plus ElevenLabs Generate Speech. Thank you.
```

## Speaker tips for a Chinese ESL recorder

1. **Pace > polish.** 145 WPM (this script) is comfortable; chasing
   native English speed (170+ WPM) usually breaks pronunciation.
2. **Half-second pause between segments.** Let the screen action
   finish before the next sentence starts.
3. **Stress these phrases each time they appear:**
   - **"Anchored, not stored"** (twice)
   - **"Real on-chain write"**
   - **"Zhu Laiyi is a real professor on our class schedule"**
   - **"No third-party indexer"**
4. **Pronounce technical strings only by their leading characters:**
   - `Cmv8` — say "see-em-vee-eight"
   - `5L76cFugq` — say "five-ell-seven-six-see-eff-you-gee-cue"
   - `MemoSq4gqAB` — say "memo-ess-cue-four-gee-cue-ay-bee"
   - `ed25519` — say "ee-dee-twenty-five-five-one-nine"
   - `multilingual_v2` — say "multi-lingual vee two"
   - `web3.js` — say "web-three dot jay-ess"
   - `program.account.classAnchor` — say
     "program dot account dot class-anchor"
5. **Don't read full 44-character public keys / signatures.** First
   four to nine characters is enough — the video shows the full
   string on screen.
6. **Zhu Laiyi pronunciation guide for the key beat at 1:02:**
   - Zhu — like "joo" (a single soft beat)
   - Laiyi — like "lie-ee" (two short beats)
   - Hold the cursor on the Chinese statement so a non-Chinese
     judge sees the original characters even if they don't catch
     the spoken name.
7. **Do NOT speak over the 4 seconds of French ElevenLabs audio at
   0:08–0:12.** Let the George voice carry that beat — it's the
   only direct AI-output proof in the demo, and you cannot show
   ElevenLabs more cleanly than letting the model speak.

## Pre-recording checklist

- [ ] Production buildTime ≥ `2026-05-09T09:15:36Z`
      (`curl https://www.rucmathclass.com/health.json` to confirm).
- [ ] At least two `class_anchor` PDAs visible on `/web3-profile §04`
      Class collective tab — including the Zhu Laiyi entry.
- [ ] Phantom is on Devnet, funded ≥ 0.05 SOL.
- [ ] Phantom is **disconnected** from `rucmathclass.com` so §01
      "Connect" can be demonstrated.
- [ ] Browser signed out of Supabase (or an incognito window) so
      §01 doesn't expose a real institutional email address.
- [ ] Chrome window mode (NOT full-screen) so Phantom popups stay
      in the recording region.
- [ ] Bookmark bar hidden (Cmd+Shift+B).
- [ ] Hard refresh (Cmd+Shift+R) the live URL once before
      recording.
- [ ] macOS Focus mode on; Slack / WeChat / Mail closed.
- [ ] Laptop speaker on at ~70% so the ElevenLabs narration plays
      into the microphone.
- [ ] `docs/demo_video_script.md` (this file) open on a phone or
      second monitor for live cueing.

## Where to upload

YouTube **Unlisted** (preferred), or Vimeo. Paste the URL into the
Dev3pack submission form at `hack.dev3pack.xyz/member/projects` →
Step 3 "Links & video".

YouTube description template (copy verbatim):

```
A bilingual class memory anchored on Solana devnet. Solo Dev3pack
2026 submission by Jin Shuopeng, freshman at Renmin University of
China Sino-French Institute Suzhou.

🔗 Live: https://www.rucmathclass.com
🔗 Web3 entry: https://www.rucmathclass.com/web3-profile
🔗 Custom Anchor program demo: https://www.rucmathclass.com/witness
🔗 GitHub (MIT): https://github.com/jsfjsf20070513-a11y/MathClassWebsite-public

⛓ Custom Anchor program (Solana devnet):
   Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu
   https://solscan.io/account/Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu?cluster=devnet

🎙 Voice by ElevenLabs (multilingual_v2, George)
🤖 Bilingual proof reasoning by Anthropic Claude
🎓 Built for the bilingual mathematics class at RUC Sino-French Institute Suzhou

Tracks:
- Solana — custom Rust Anchor program + SPL Memo writes + live RPC reads
- ElevenLabs — Generate Speech integration path

00:00 Hero · Dev3pack entry
00:08 ElevenLabs French narration
00:18 Connect Phantom on devnet
00:28 ed25519 sign · bilingual student statement
00:40 SPL Memo anchor on Solana devnet
01:02 Class collective memory · "Anchored, not stored"
01:22 Custom class_anchor Anchor program
01:38 Bilingual theorem proofs · Anthropic Claude + KaTeX
01:48 Close

#Web3 #AI #Solana #Student #Hackathon #Dev3pack
```
