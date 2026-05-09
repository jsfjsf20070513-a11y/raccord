export const web3ProfileLinks = {
  hackathon: '/hackathon',
  github: 'https://github.com/jsfjsf20070513-a11y/MathClassWebsite-public',
  demoVideo: 'https://youtu.be/kz9K5mWtC20',
}

export const walletIdentity = {
  status: 'Real wallet connection MVP',
  network: 'Solana Devnet target, no transaction',
  address: 'Connect a wallet to display the public address.',
  nextStep: 'Link wallet identity to the existing student collaboration profile.',
  safety:
    'No private keys, seed phrases, service role key, or mainnet transactions are handled. The wallet is used as a non-financial identity layer only. Ownership can be optionally proven through an off-chain ed25519 signature in the next section.',
}

export const onchainAnchor = {
  prompt:
    'Sign and send a real Solana transaction on devnet that anchors a short tag identifying this student profile. Two write paths share this section: the SPL Memo program v2 (lightweight, no program state) and a custom class_anchor Anchor program written in Rust for this hackathon (creates a per-call PDA storing author, statement, timestamp, nonce). No SOL is transferred between accounts; only the standard signature fee (~0.000005 SOL) is paid by the wallet, plus rent for the small PDA when the Anchor program path is used.',
  safety:
    'Devnet only. Devnet SOL has no monetary value and cannot be exchanged for mainnet SOL. The payload (memo or PDA `statement`) is short and ASCII-only, designed to remain readable on Solscan without specialized tooling.',
  faucetUrl: 'https://faucet.solana.com',
  faucetHelp:
    'Wallet has insufficient devnet SOL. Visit faucet.solana.com, paste this wallet address, request 1 SOL (free), then retry.',
  phantomWarningNotice:
    'Phantom may flag this domain as "could be malicious" because rucmathclass.com is a new dApp not yet listed in the Blowfish dApp registry. This is the default behavior for any new hackathon project. The transaction invokes either the SPL Memo program v2 or our custom Anchor program (both on devnet, no SOL transfer to other accounts). You can audit the exact instruction code below before approving.',
  sourceCodeLabel: 'Audit the memo transaction source code',
  sourceCodeUrl:
    'https://github.com/jsfjsf20070513-a11y/MathClassWebsite-public/blob/main/src/lib/solanaMemo.js',
}

export const messageStatement = {
  prompt:
    'Sign a short bilingual student statement with the connected wallet. The signature is produced locally by the wallet using ed25519, never exposes private keys, and does not send any transaction.',
  safety:
    'Off-chain ownership proof. No fee, no transaction, no on-chain write at this step. The signature can be independently verified by anyone holding the public wallet address using standard ed25519 verification (for example @solana/web3.js verify or tweetnacl). The on-chain write happens in the next section using either the SPL Memo program or our custom Anchor program.',
  buildStatement: ({ address, issuedAt }) =>
    `I am a student of the bilingual mathematics class at Renmin University of China — Suzhou campus.
Je suis étudiant·e de la classe de mathématiques bilingue à RUC — campus de Suzhou.

Wallet:  ${address}
Issued:  ${issuedAt}
Project: Math Class Website (Dev3pack solo submission)`,
}

export const contributionRecords = [
  {
    title: 'Built and deployed class collaboration website',
    detail: 'Created the base React, Vite, and Supabase-powered product for class information and collaboration.',
  },
  {
    title: 'Prepared public-safe GitHub repository',
    detail: 'Cleaned the repository for public hackathon review without exposing private class media or credentials.',
  },
  {
    title: 'Added hackathon showcase page',
    detail: 'Packaged the project story, problem, features, tech stack, role, and roadmap for judge review.',
  },
  {
    title: 'Added README, screenshots, and demo video',
    detail: 'Prepared submission materials so reviewers can understand the project quickly from GitHub.',
  },
  {
    title: 'Prepared AI-assisted development workflow',
    detail: 'Documented how AI tools supported coding, debugging, deployment notes, and presentation materials.',
  },
]

export const contributionSummary =
  'This student profile summarizes contributions across class collaboration, documentation, deployment, and hackathon preparation. The on-chain anchor in §03 — both the SPL Memo path and the custom class_anchor Anchor program — turns each acknowledged contribution into a permanently verifiable signature, while the §04 collective feed reads them back in real time from devnet RPC across the class wallet registry.'

export const stretchGoals = [
  'Append-only `anchor_message` instruction extending the class_anchor program for in-class threaded comments under each plate',
  'Streaming Claude Q&A via Cloudflare Worker (server-side API key) so the bilingual proof tutor can answer arbitrary new theorems instead of the pinned 24',
  'Wallet-linked Supabase student profile via Sign-in with Solana (SIWS) — JWT bridges devnet identity to the existing Supabase RLS layer',
  'Soulbound contribution badge for active class members as a Solana cNFT via Metaplex Bubblegum',
  'Helius webhook indexer replacing the public devnet RPC polling, so the §04 feed reflects new anchors within seconds even after RPC pruning',
]
