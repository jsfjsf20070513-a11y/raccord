# CLAUDE.md — MathClassWebsite-public(math 线 · 双语链上版)

主站的**公开发布 + Dev3pack 黑客松版**:在原班级站之上加了 Solana 链上锚定、ed25519 身份、ElevenLabs 法语朗读、Claude 双语证明。**班级是主角,web3/AI 是叠加层,不是替代。**

## 定位

- 线上:`https://rucmathclass.com/`(Cloudflare 代理 + Vultr Nginx);开源:GitHub `MathClassWebsite-public`(MIT)
- 提交方向:Dev3pack 的 **Solana** 与 **ElevenLabs** 两条赛道
- 评委 5 分钟可验证的 7 项能力见 README 顶部表

## 比主站多出来的核心能力

| 能力 | 代码位置 |
|---|---|
| Phantom 钱包连接 | `src/lib/walletProvider.js`、`src/pages/Web3StudentProfile.jsx` |
| **off-chain ed25519 身份签名**(base58) | `Web3StudentProfile.jsx`(身份证明段) |
| **链上写入 · SPL Memo v2** | `src/lib/solanaMemo.js` |
| **自写 Rust Anchor 程序 `class_anchor`**(devnet) | `programs/class-anchor/src/lib.rs`、`src/lib/classAnchor.js`、`docs/anchor-program.md` |
| 班级集体 memo feed(读链)| `getSignaturesForAddress` 解析,`src/data/classRegistry.js` |
| **ElevenLabs 法语朗读**(multilingual_v2)| `src/components/TitlePageNarration.jsx` |
| Claude 双语定理证明(24 条,KaTeX)| `Home.jsx` 每日定理折叠展开;源 `src/data/theoremExplanations.js`(**zh/fr 为分步数组**,Home 渲染成 ①②③④);构建期预渲染 → `theoremExplanations.generated.js`(`scripts/render-theorems.mjs`) |
| Solana 见证页 | `src/pages/SolanaWitness.jsx` |
| **SRS 双语背词器**(艾宾浩斯阶梯 + 新旧交替 + 法语领域校验)| 纯核心 `src/lib/srsScheduler.js`(已单测)、持久层 `src/lib/vocabularyBackend.js`、词库 `src/data/frenchVocabulary.js`(**A1–C2 `level` 字段 · 现 ~3650 词**)、页面 `src/pages/Vocabulary.jsx`(路由 `/vocabulary`,**CEFR 级别选择器** + 6 题型 + 真人发音)、建表 `setup_vocabulary.sql` |
| **班级 AI 助手**(中法双语答疑 · KaTeX 公式 · 拍题问图 · 云端历史 · 限流)| 前端 `src/pages/Assistant.jsx`(路由 `/assistant`,登录可用);后端 **Cloudflare Worker** `worker/`(见下「AI 后端」节) |
| **背词真人发音**(on-demand) | Worker `GET /api/speak` 代理 ElevenLabs,Cloudflare 边缘缓存;前端 `Vocabulary.jsx speak()`,失败回退浏览器 TTS |
| **AI 对话云端历史**(per-user) | `src/lib/aiAssistantBackend.js` + 表 `ai_messages`(建表 `setup_ai_history.sql`,RLS 自我隔离) |

## 技术栈(在主站基础上)

- React 18 + React Router 7 + Vite 5 · **静态 SPA**(BrowserRouter,路由路径式)· KaTeX(`src/vendor.css` 经 index.html 全局引)· **`@solana/web3.js` 1.98 · `@coral-xyz/anchor` 0.29 · bn.js · bs58 · buffer**(polyfill:`src/lib/solanaPolyfill.js`)
- ElevenLabs `multilingual_v2`(朗读 + 背词发音)· **Gemini `gemini-flash-latest`**(AI 助手,经 Worker)· Anthropic Claude(开发辅助 + 双语证明)
- Supabase **anon-only + RLS** · Cloudflare proxy + Vultr Nginx · **AI 后端 = Cloudflare Worker**(见下)
- 测试:**vitest**(`src/lib/*.test.js`,纯安全逻辑 + SRS 调度器);CI 跑 lint → test → build(node 版本以 `.nvmrc` 为准)
- 安全:`npm audit --omit=dev --audit-level=high` → 0 漏洞(另有 5 个 moderate 来自 `@solana/web3.js` 传递依赖,上游暂无修复;详见 README)

## 运行 / 部署

```bash
npm install
npm run dev
npm run build
npm test          # vitest run(单元测试)
npm run lint
```
- Rust Anchor 程序在 `programs/class-anchor/`,部署说明见 `docs/anchor-program.md`(含 program ID + deploy tx)。
- 链上为 **devnet**,读历史不需 Phantom。
- SRS 背词器需在 Supabase 执行 `setup_vocabulary.sql` 建 `review_states` 表;AI 云端历史需执行 `setup_ai_history.sql` 建 `ai_messages` 表(都自带 RLS,与 `harden_rls.sql` 同口径:只能读写自己的行;表没建时**优雅降级**,不报错)。
- **扩词库**:真相源是 **`scripts/vocab-source.json`**(全量词,含 `level`);改它后跑 `npm run vocab:import scripts/vocab-source.json`(dry run 出校验报告)→ 加 `--out src/data/frenchVocabulary.js` 才写文件(**整文件替换,非追加**)。`cleanFrenchWord` 强制:名词带 `gender∈{m,f}`、动词带 `conjugation`;`id` 由 `french` 去音符派生,**别改已有词 id**(对应 `review_states.word_id`,改了丢进度)。同形词(如 ensemble 名/副)须给显式 `id` 消歧。
- **生产部署**:`./deploy.sh`(需 env `MATHCLASS_DEPLOY_HOST=149.28.69.75 MATHCLASS_DEPLOY_USER=root MATHCLASS_DEPLOY_SSH_KEY=~/.ssh/mathclass_deploy`)。它注入真实班级照片(从本地 `../MathClassWebsite` commit `a88bdc5`)→ `npm run build` → `rsync dist/` 到 Vultr → 退出时清理照片。**验证**:`health.json` 的 `buildTime` 刚刚 + 域名==IP直出(`http://149.28.69.75/health.json`)。首次 SSH 偶发瞬断,重试即成。**只从本仓部署,绝不从存档仓 `MathClassWebsite`**。

## AI 后端(Cloudflare Worker `mathclass-ai`)

代码在 **`worker/`**(`src/index.js` + `wrangler.toml`);**排除出根 eslint**(独立工具链)。CF 账号 `e8a07064766785bda8f55c8cea4652f2`。一个 Worker 按 path 分发两个无状态端点:

- `POST /api/chat` → Gemini `gemini-flash-latest` 双语答疑;支持多模态:body 可带 `image{mimeType,data(base64)}` → 附到最后一条 user 的 inlineData(拍题问图)。`maxOutputTokens:8192`(中文+LaTeX 耗 token,小了会截断)。
- `GET /api/speak?text=…` → ElevenLabs 真人法语朗读,`caches.default` 边缘缓存(每词只生成一次,配额只在首次消耗)。
- key 都是 **Wrangler secret**(`GEMINI_API_KEY` / `ELEVENLABS_API_KEY`),**绝不进代码/前端产物**;前端只调同域 `/api/chat`、`/api/speak`。换 key 走 CF 控制台 Secrets 或 `wrangler secret put`,不改代码。
- 重新部署:`cd worker && CLOUDFLARE_API_TOKEN=<Edit Workers token> CLOUDFLARE_ACCOUNT_ID=e8a0… npx wrangler@4 deploy`。
- ⚠️ **CF 路由通配符坑**:带 `?query` 的端点路由**必须用 `…/api/speak*`**(无 `*` 不匹配带 query 的请求,会漏到源站返回 SPA index.html);`/api/chat`(POST 无 query)无 `*` 也行。
- 限流:Cloudflare 原生绑定 `RATE_LIMITER`(每 IP 60s 30 次,wrangler.toml `[[unsafe.bindings]]`)。
- 额度认知:Gemini 走**免费层**;Google AI Pro 套餐**不含 API 额度**。转售 API(中转站)违反 ToS,不做。

## 不要乱改 / 风险

- **链上是不可逆的**:anchor/memo 写入 devnet 后无法撤回,改 `solanaMemo.js` / `classAnchor.js` 前想清楚。
- Solana 依赖需要 Buffer/polyfill,动构建配置注意 `solanaPolyfill.js` 与 `vite.config.js`。
- **Supabase RLS 是唯一安全边界**:前端 anon-only,所有 `.from()` 全靠 RLS 兜底——别引入需 service-role 的写法到前端。本仓与原班级站**共用同一 Supabase 项目**,RLS 是共享边界,改表/权限要同步 RLS 策略脚本(权威状态以 `harden_rls.sql` 为准)。
- 🔴 **审核回执是“文本当协议”,改前必重验**:`comments` 表 `album_id=0` 的 ops 行用 content 里的 `__mathclass_ops__::{...}` JSON 承载审核信封(`src/lib/opsQueue.js`、`src/components/Comments.jsx`);“回执只属于本人”靠 RLS 强制 moderation 信封必须管理员身份才能写入。**任何放松该 insert/update 写入守卫的改动,会静默重开“伪造他人案卷回执”——改这段必重验双守卫。**
- **PII 列遮蔽**:anon 对 `comments` 不授 `user_email`,前端必须显式列名查询(`Comments.jsx`),别改回 `select=*`。
- `programs/class-anchor` 改了要重新 `anchor build && deploy`,并更新 program ID。
- **AI 后端 key 红线**:Gemini/ElevenLabs key 只在 Cloudflare Worker secret;**绝不**进前端打包(进了 = 任何人 F12 偷走刷爆配额)。`ai_messages` 是**新增独立表**,与现有表无关联——加它不碰 `review_states`/`comments`/`albums`。
- **图片问答配额**:图片比文字耗 token;Worker 已限类型(jpeg/png/webp)+ base64 ≤~5MB + 前端 canvas 压到最长边 1536。量大要开 Gemini 付费层,别买 AI Pro(那不解决 API 额度)。
