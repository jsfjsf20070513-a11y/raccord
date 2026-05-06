# Hackathon Application Materials

## Public Contact Placeholders

- Email: TODO: Add contact email
- GitHub: https://github.com/jsfjsf20070513-a11y/MathClassWebsite-public
- Demo video: https://youtu.be/kz9K5mWtC20

## Dev3pack Solo Direction

AI-assisted student collaboration website with Solana wallet-based identity and contribution records. The `/web3-profile` page now supports a real injected Solana wallet connection, such as Phantom, and displays the public wallet address only. It uses no private keys, no seed phrases, no service role key, no smart contract, no signature request, and no mainnet transaction. The next phase can evaluate Solana Wallet Adapter or compatible wallet integration for a broader wallet-selection flow.

## Dev3pack Final Submission Draft

### Project Name

Math Class Website: Web3 Student Profile

### One-liner

A calm, text-first class collaboration website extended with a Solana-compatible wallet identity layer for non-financial student contribution profiles.

### Description

Math Class Website is a class collaboration and knowledge-sharing website for a bilingual mathematics cohort. It keeps class information, learning resources, activity records, collaboration drafts, and public project materials in one minimal, readable interface. For Dev3pack, I prepared a Web3 Student Profile page that connects the existing class collaboration story with a Solana-compatible wallet identity layer.

The Web3 feature is intentionally small and safe. It uses an injected Solana wallet provider such as Phantom to request a wallet connection and display the public wallet address only. The wallet is treated as a non-financial identity signal for future contribution records, not as a payment or trading feature. The MVP does not handle private keys, seed phrases, balances, signatures, smart contracts, service role keys, devnet proof transactions, or mainnet transactions.

This project is not a claim that I independently built the entire system from scratch. My role was to help shape the product direction, maintain and organize content, support AI-assisted implementation and debugging, participate in deployment preparation, clean the public GitHub repository, write documentation, prepare screenshots, and create the demo material. The result is a practical student-builder project that shows how a beginner Web3 builder can responsibly add a small Solana-compatible identity layer to an existing AI-assisted web product.

### Tech Stack

- Frontend: React, Vite, React Router, JavaScript
- UI: custom CSS, lucide-react icons, KaTeX, local fonts
- Backend services: optional Supabase Auth, Postgres, and storage-related workflows
- Web3 layer: injected Solana wallet provider such as Phantom
- Deployment: static Vite build, Nginx/VPS deployment, public-safe GitHub repository
- AI-assisted workflow: used for product planning, implementation support, debugging, documentation, and demo preparation

### Honest Contribution Wording

I am a first-year mathematics student and AI-assisted builder. I did not independently build the entire project from scratch. My contribution was to clarify the product direction, maintain and organize class-facing content, use AI tools to support implementation and debugging, participate in deployment and public repository preparation, write README and application materials, prepare screenshots, and create the demo narrative. For the Dev3pack version, I helped frame the Web3 extension as a small Solana-compatible identity layer that displays only a public wallet address and keeps financial or on-chain functionality out of scope.

## 30 Second Self Introduction

Hi, I am a first-year Mathematics student at Renmin University of China, Sino-French Institute in Suzhou. I am interested in AI-assisted development, mathematical modeling, and fast product prototyping. I have been working on a class collaboration website and preparing it as a public hackathon project, focusing on product direction, content organization, AI-assisted implementation support, deployment participation, documentation, GitHub preparation, and demo storytelling.

## 100 Word Project Description

Math Class Website is a deployed class knowledge hub for a bilingual mathematics cohort at Renmin University of China, Sino-French Institute in Suzhou. It solves the problem of scattered class information by organizing schedules, event albums, learning resources, and collaboration drafts into one readable web product. The site is built with React, Vite, React Router, custom CSS, KaTeX, and optional Supabase integration for authentication, comments, submissions, and moderation. A dedicated `/hackathon` page explains the problem, solution, tech stack, my role, AI assisted workflow, and roadmap so judges can understand the project within 30 seconds.

## 200 Word Project Description

Math Class Website is a deployed class website and hackathon showcase built from a real campus need. In a small bilingual mathematics cohort, useful information often gets scattered across chat history, cloud folders, temporary links, and personal notes. This makes schedules, event memories, and learning resources hard to retrieve after the moment has passed.

The project turns that scattered information into a lightweight public web product. Visitors can open the homepage to see the class identity, a daily theorem note, course schedule, activity photo records, and curated reading paths. They can also browse albums and resource pages without logging in. When Supabase is configured, the site supports authentication, comments, submission workflows, and moderation routes for publishing official content.

The frontend uses React, Vite, React Router, custom CSS, KaTeX, and lucide-react icons. Deployment is based on a static Vite build served by Nginx, with a generated `/health.json` endpoint and a suggested Nginx `/health` JSON check. The project also includes a dedicated `/hackathon` page, README, deployment notes, and demo script. My role is freshman math student and AI-assisted builder: I help shape the product direction, organize content, support implementation with AI tools, participate in deployment preparation, and verify the final public-facing materials.

## 60 Second Demo Video Script

### 0-10s: Problem

"In a small bilingual mathematics class, important information is easy to lose. Schedules, photos, resource links, and collaboration drafts often live in chat messages or temporary folders."

### 10-20s: Target Users

"The target users are classmates, student contributors, and reviewers who need a stable place to understand what the class is learning, saving, and building together."

### 20-45s: Core Feature Demo

"Here is the homepage. It gives the class identity, a daily theorem note, the course schedule, image plates, and reading paths. From the gallery, users can browse structured activity albums. From resources, they can open curated study materials. The collaboration area supports Supabase-backed login, submissions, review, and publishing when the backend variables are configured. For hackathon judges, I added this `/hackathon` page so the project can be reviewed quickly."

### 45-55s: Tech Stack

"The stack is React, Vite, React Router, custom CSS, KaTeX, lucide-react, and optional Supabase for auth, database, comments, and moderation. Production is a static build served by Nginx."

### 55-60s: Future Plan

"Next I will add the public GitHub link, attach the demo video URL, review Supabase RLS, and connect HTTPS with a custom domain."

## 5 Slogan Options

1. A class website that turns scattered student memory into a working product.
2. From math cohort notes to a deployed AI assisted web prototype.
3. A lightweight knowledge hub built by a freshman math student.
4. Real campus workflow, fast AI assisted prototype, deployed result.
5. Mathematics background meets AI native product building.

## Common Hackathon Application Answers

### Why do you want to join this hackathon?

I want to join because hackathons are one of the fastest ways to test whether I can turn a real problem into a working product under time pressure. As a freshman mathematics student, I want to learn how stronger builders think about product scope, engineering tradeoffs, teamwork, and demo storytelling. I am especially interested in events where AI assisted development, rapid prototyping, and mathematical reasoning can be combined.

### What have you built before?

I have worked on a class collaboration website for my mathematics cohort and helped prepare it as a public hackathon project. It includes a public homepage, course context, event albums, curated resources, authentication-related pages, comments, submission workflows, and moderation routes powered by Supabase when configured. I also prepared the public-safe GitHub repository, `/hackathon` showcase page, `/web3-profile` page, README, screenshots, demo video material, health check notes, deployment notes, and application materials to make the project easier for judges and teammates to evaluate.

### What role can you play in a team?

I can help with problem breakdown, product logic, mathematical modeling, content structure, AI-assisted implementation support, debugging, deployment checks, GitHub preparation, and demo materials. I am not positioning myself as a senior engineer. My value is that I can learn quickly, use AI tools actively, keep the product goal clear, and help the team turn ideas into a presentable prototype.

### How did you use AI tools responsibly?

I used AI tools as accelerators for coding, debugging, refactoring, documentation, and research. I did not treat AI output as automatically correct. I reviewed the code, ran build and lint checks, checked deployment behavior, and made final decisions based on whether the result served the product. I also keep secrets out of prompts and source files, and I understand that browser-exposed variables such as Supabase anon keys still require Row Level Security.

### What technologies are you comfortable with?

I am comfortable working with React, Vite, JavaScript, CSS, React Router, npm, static deployment, Nginx basics, Supabase Auth and database concepts, Git/GitHub workflows, and AI assisted coding tools such as Codex GPT 5.5, Claude Opus, Claude Sonnet, and Gemini Google AI Pro. I am also building my foundation in mathematics, Python, and modeling.

### What do you hope to learn?

I hope to learn how to build with a team under real time constraints, how to scope a hackathon idea sharply, how to combine math modeling with usable software, and how to present technical decisions clearly. I also want to learn better engineering habits, including testing, API design, data security, and collaborative Git workflows.
