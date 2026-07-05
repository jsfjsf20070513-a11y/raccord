# CLAUDE.md

本仓的当前工程约束以同目录 [`AGENTS.md`](./AGENTS.md) 为准，改动前必须完整阅读。

2026-07-03 起的关键状态：

- 三世界 Page du jour 已成为首页主线。
- Web3 前端与 Solana 依赖已退役；`programs/class-anchor/` 只作历史，不再部署。
- 新寄语写入 Supabase `testimonials` 表，RLS 权威状态仍为 `harden_rls.sql`。
- AI Worker、SRS 词库管线、comments ops 回执守卫与 PII 列遮蔽不得因设计改造而改弱。
