# 在 Raccord 工作

Raccord 是独立的交互作品。2026-11-04，用户确认采用纯静态版本，只保留入口和第一章。当前仓库不再提供账号、背词、AI、数据库或 Worker；不要从旧分支把这些服务接回来。

先读 [README.md](README.md)，了解作品、代码目录和检查命令。发布步骤见 [deployment/RACCORD_DEPLOY.md](deployment/RACCORD_DEPLOY.md)。`AGENTS.md` 指向本文件，不另写一份。

- 先核对当前代码和现场。文档不能证明网站已经上线。
- 改章节先看 `src/chapters/poincare/`。应用入口在 `src/app/`，通用代码在 `src/shared/`；引用规则见 README，由 `npm run check:architecture` 检查。
- 页面变化先说明并给前后对比，得到用户确认后再做。不自行增加提示、按钮或装饰。
- 修改后运行 `npm run check`、`npm run build` 和 `npm audit --omit=dev --audit-level=high`。交互变化还要检查桌面、手机、世界切换和禁止本地存储的情况。
- 同一个工作目录只由一个代理改文件。
- 合并、推送和线上发布须有用户明确授权。合并授权不包含发布；删除分支或改写历史前，先打备份标签并推到远端。
- 两条第二章实验分支仍待用户决定，本次保留，不合并、不删除。
- Markdown 用自然中文写清楚事情。已有文档能说明的内容直接改原文，不增加重复的规划、审计或交接文档。
