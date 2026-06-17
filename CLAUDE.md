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
| Claude 双语定理证明(24 条,KaTeX)| `Home.jsx` 每日定理展开 |
| Solana 见证页 | `src/pages/SolanaWitness.jsx` |
| **SRS 双语背词器**(艾宾浩斯阶梯 + 新旧交替 + 法语领域校验)| 纯核心 `src/lib/srsScheduler.js`(已单测)、持久层 `src/lib/vocabularyBackend.js`、词库 `src/data/frenchVocabulary.js`、页面 `src/pages/Vocabulary.jsx`(路由 `/vocabulary`)、建表 `setup_vocabulary.sql` |

## 技术栈(在主站基础上)

- React 18 + Vite 5 · **`@solana/web3.js` 1.98 · `@coral-xyz/anchor` 0.29 · bn.js · bs58 · buffer**(polyfill:`src/lib/solanaPolyfill.js`)
- ElevenLabs `multilingual_v2` · Anthropic Claude(开发辅助 + 双语证明)
- Supabase **anon-only + RLS** · Cloudflare proxy + Vultr Nginx
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
- SRS 背词器需在 Supabase 执行 `setup_vocabulary.sql` 建 `review_states` 表(自带 RLS,与 `harden_rls.sql` 同口径:用户只能读写自己的行)。表没建时页面优雅降级提示。

## 不要乱改 / 风险

- **链上是不可逆的**:anchor/memo 写入 devnet 后无法撤回,改 `solanaMemo.js` / `classAnchor.js` 前想清楚。
- Solana 依赖需要 Buffer/polyfill,动构建配置注意 `solanaPolyfill.js` 与 `vite.config.js`。
- **Supabase RLS 是唯一安全边界**:前端 anon-only,所有 `.from()` 全靠 RLS 兜底——别引入需 service-role 的写法到前端。本仓与原班级站**共用同一 Supabase 项目**,RLS 是共享边界,改表/权限要同步 RLS 策略脚本(权威状态以 `harden_rls.sql` 为准)。
- 🔴 **审核回执是“文本当协议”,改前必重验**:`comments` 表 `album_id=0` 的 ops 行用 content 里的 `__mathclass_ops__::{...}` JSON 承载审核信封(`src/lib/opsQueue.js`、`src/components/Comments.jsx`);“回执只属于本人”靠 RLS 强制 moderation 信封必须管理员身份才能写入。**任何放松该 insert/update 写入守卫的改动,会静默重开“伪造他人案卷回执”——改这段必重验双守卫。**
- **PII 列遮蔽**:anon 对 `comments` 不授 `user_email`,前端必须显式列名查询(`Comments.jsx`),别改回 `select=*`。
- `programs/class-anchor` 改了要重新 `anchor build && deploy`,并更新 program ID。
