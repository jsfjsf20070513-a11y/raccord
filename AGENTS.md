# AGENTS.md — MathClassWebsite-public

本仓是 math 主线唯一活跃代码仓与 `rucmathclass.com` 的构建来源。改代码、提交、部署只在这里进行；兄弟仓 `MathClassWebsite` 已归档，只作为私有班级照片源。

## 当前产品状态（2026-07-03）

- React 18 + React Router 7 + Vite 5 静态 SPA，Supabase anon client + RLS。
- 三世界：`carnet`（默认档案馆）、`plan`（门面/书目）、`limite`（背词与 AI 仪器）。
- 世界状态写入 `localStorage.carnet_world`，首访入口使用 `localStorage.carnet_visited`，根节点为 `<html data-world>`.
- 首页是同一天、同一定理、同一句冥想的三种「Page du jour」版式；数据继续来自 `dailyTheoremNotes.generated.js` 与 `siteContent.js`。
- `/testimonials` 是 Carnet 寄语簿；历史链上人类内容已静态归档，新写入使用独立 `testimonials` 表。
- Web3 前端已退役。`programs/class-anchor/` 与 Anchor 文档只作历史，不再 build/deploy；不得重新接回钱包、Solana 依赖或链写入 UI。
- `/vocabulary` 的 SRS、词库真相源与 `/assistant` 的 Cloudflare Worker 保持原管线。

## 常用命令

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

`predev` / `prebuild` 会运行定理预渲染与 health 生成。

## 数据库与安全红线

- 本仓与归档仓共用 Supabase 项目 `xfwkjhajrqxsakzovcwx`；RLS 是唯一安全边界。
- 权威 RLS 状态是 `harden_rls.sql`。新增表/策略时同步其独立 setup 脚本与 `harden_rls.sql`。
- 寄语簿首次上线前执行 `setup_testimonials.sql`；未执行时前端必须只读降级。
- `comments.album_id = 0` 是 ops queue；`__mathclass_ops__::` 审核回执属于“文本当协议”，不得放松 moderation 双守卫。
- `comments.user_email` 对 anon 遮蔽；查询必须显式列名，禁止 `select('*')`。
- 角色提升只允许 `super_admin`，继续通过 `public.is_super_admin()` 的 security-definer 边界。
- Gemini / ElevenLabs key 只放 Cloudflare Worker secret，绝不进入前端环境变量或产物。

## 视觉约束

- 只允许一个强调色，且必须和底色同温度。
- Carnet：`#fdfcf8 / #1a1a1a / #8b0000`，EB Garamond + Noto Serif SC，无框表单与发丝线。
- PLAN ℝ：`#e9e7df / #121211 / #1a23e6`，Archivo 900 + 方格/制图结构；已验收视觉，改动前先问。
- Limite：`#100d0b / #ece7dd / #ff4d2e`，Archivo 900 + JetBrains Mono，动态信号仪器。
- 每屏一个主视觉重心；不要把正文装进通用圆角卡片。

## 部署

只运行本仓 `./deploy.sh`。它从兄弟仓固定 commit `a88bdc5` 注入私有照片、构建并 rsync 到 VPS。绝不运行 `MathClassWebsite/deploy.sh`。

部署后检查 `health.json` 的新 buildTime，并比较域名与 `http://149.28.69.75/health.json`。没有明确请求时不要自行部署。
