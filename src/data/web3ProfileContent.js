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

export const messageStatement = {
  prompt:
    'Sign a short bilingual student statement with the connected wallet. The signature is produced locally by the wallet using ed25519, never exposes private keys, and does not send any transaction.',
  safety:
    'Off-chain ownership proof. No fee, no transaction, no smart contract. The signature can be independently verified by anyone holding the public wallet address using standard ed25519 verification (for example @solana/web3.js verify or tweetnacl).',
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
  'This student profile summarizes contributions across class collaboration, documentation, deployment, and hackathon preparation. The next version will connect wallet identity to real contribution records and optionally generate AI-assisted summaries from verified project activity.'

export const stretchGoals = [
  'Devnet memo transaction anchoring contribution hash on Solana',
  'AI-assisted bilingual project summary (Claude / ElevenLabs)',
  'Wallet-linked Supabase profile',
  'On-chain contribution badge for active class members',
  'Cross-class identity portability via wallet signature exchange',
]
