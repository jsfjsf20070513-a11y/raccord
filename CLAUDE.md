# 在 Raccord 工作

这是独立的纯静态交互作品。先读代码，再改说明；文档不替代实现，也不证明线上状态。

项目结构、命令和本地记录见 [README.md](README.md)。发布步骤只看 [deployment/RACCORD_DEPLOY.md](deployment/RACCORD_DEPLOY.md)。`AGENTS.md` 指向本文件，不另写一份。

- 入口是 `src/main.jsx` 和 `src/app/App.jsx`。当前页面只有 `/enter`、`/` 和找不到页面时的出口。
- 改章节行为先看 `src/chapters/poincare/`；通用代码在 `src/shared/`。依赖方向由 `npm run check:architecture` 检查。
- 修改后运行 `npm run check` 和 `npm run build`；交互变化还要检查桌面、手机、世界切换及禁用本地存储的情况。
- 只改当前仓。这里没有数据库、Worker 或其他站点的运维职责。
- 同一个工作目录只由一个代理改文件。并行协作者可以只读检查。
- 合并、推送和线上发布需要用户明确授权。开发与验证可以在独立分支连续完成。
- 文档只维护这份入口、README 和部署说明。已有位置能说清的内容直接改原文，不再增加审计单、交接单或规划副本。
