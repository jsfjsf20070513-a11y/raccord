export const showcaseLinks = {
  liveDemo: '/',
  projectUrl: 'http://149.28.69.75/hackathon',
  github: 'TODO: Add GitHub repository URL',
  demoVideo: 'TODO: Add demo video URL',
}

export const showcaseStats = [
  { label: 'Project type', value: 'Class knowledge hub' },
  { label: 'Current stage', value: 'Deployed MVP' },
  { label: 'Built by', value: 'Freshman math student' },
]

export const problemPoints = [
  {
    title: 'Target users',
    body: 'Students in a small bilingual mathematics cohort who need one place for schedules, class memories, resource links, and collaboration records.',
  },
  {
    title: 'Pain point',
    body: 'Class information often lives across chat history, scattered links, personal folders, and temporary posts, so useful material becomes hard to find later.',
  },
  {
    title: 'Why it matters',
    body: 'A cohort website turns daily academic traces into a stable public archive and gives student builders a real product surface to maintain.',
  },
  {
    title: 'Existing gap',
    body: 'Generic social feeds are fast but not structured; cloud drives are structured but not readable as a product. This site combines a readable front page with curated resources.',
  },
]

export const solutionSteps = [
  'A visitor lands on the class homepage and immediately sees the cohort identity, daily theorem note, schedule, image plates, and reading paths.',
  'Students can browse resources and albums without login, while authenticated collaborators can submit materials or draft content for review.',
  'The site keeps the production version static and lightweight, while Supabase powers optional auth, comments, and content workflows.',
]

export const keyFeatures = [
  {
    title: 'Class archive homepage',
    benefit: 'Judges can see the product purpose quickly, and classmates get a readable entry point.',
    status: 'Completed',
  },
  {
    title: 'Gallery and album records',
    benefit: 'Class events become structured visual records instead of disappearing in chat history.',
    status: 'Completed',
  },
  {
    title: 'Curated resource catalog',
    benefit: 'Learning materials can be grouped, searched mentally, and revisited across the semester.',
    status: 'Completed',
  },
  {
    title: 'Supabase-based collaboration flow',
    benefit: 'Logged-in contributors can submit, review, and publish selected class materials.',
    status: 'In progress',
  },
  {
    title: 'Hackathon showcase layer',
    benefit: 'The same deployed product can be evaluated as a builder portfolio and application artifact.',
    status: 'Completed',
  },
]

export const techStack = [
  {
    category: 'Frontend',
    value: 'React 18, React Router 7, Vite 5',
    note: 'Read from package.json dependencies and project config.',
  },
  {
    category: 'Backend',
    value: 'Not used yet',
    note: 'The current production app is a static SPA; future local APIs can be proxied under /api.',
  },
  {
    category: 'Database',
    value: 'Supabase Postgres',
    note: 'Used when Supabase environment variables are configured.',
  },
  {
    category: 'Authentication',
    value: 'Supabase Auth',
    note: 'Login, reset password, and protected moderation routes are already wired.',
  },
  {
    category: 'Deployment',
    value: 'Nginx static hosting, rsync deploy script, Vite dist output',
    note: 'Cloudflare Pages and Vercel tooling also exist in package scripts/dependencies.',
  },
  {
    category: 'AI tools',
    value: 'Codex GPT 5.5, Claude Opus, Claude Sonnet, Gemini Google AI Pro',
    note: 'Used for assisted coding, debugging, architecture review, writing, and research.',
  },
  {
    category: 'UI framework',
    value: 'Custom CSS, lucide-react icons, KaTeX, local fonts',
    note: 'No heavy component framework is used.',
  },
]

export const roleItems = [
  'Requirement breakdown and product logic design',
  'AI assisted coding for React pages, routing, styling, and deployment scripts',
  'Frontend and Supabase-backed prototype implementation',
  'Debugging, production build checks, and Nginx deployment notes',
  'Hackathon README, demo script, and application materials preparation',
]

export const aiWorkflow = [
  {
    tool: 'Codex GPT 5.5',
    use: 'Code generation, debugging, refactoring, build checks, deployment scripts, and README structure.',
  },
  {
    tool: 'Claude Opus',
    use: 'Complex architecture review and difficult issue analysis when a second reasoning pass is useful.',
  },
  {
    tool: 'Claude Sonnet',
    use: 'Frontend page drafting, copy refinement, and long-context organization for presentation materials.',
  },
  {
    tool: 'Gemini Google AI Pro',
    use: 'Research, competitor scan, hackathon preparation, slides, and demo material support.',
  },
]

export const roadmap = [
  {
    phase: 'Before Hackathon',
    tasks: [
      'Record a 60-second demo video and add the final link.',
      'Replace GitHub placeholder with the public repository.',
      'Review Supabase Row Level Security policies table by table.',
      'Add real screenshots to the README after the final UI pass.',
    ],
  },
  {
    phase: 'During Hackathon',
    tasks: [
      'Use the site as a live portfolio when finding teammates.',
      'Extend the prototype around a clear math modeling or student workflow problem.',
      'Document AI prompts, human decisions, and validation steps during development.',
      'Keep a small changelog for judging and final presentation.',
    ],
  },
  {
    phase: 'After Hackathon',
    tasks: [
      'Connect a custom domain and HTTPS certificate.',
      'Turn repeated content workflows into reusable admin tools.',
      'Add analytics for anonymous page health and resource usage.',
      'Write a short technical case study for future applications.',
    ],
  },
]
