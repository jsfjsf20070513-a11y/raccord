# CLAUDE.md — Raccord

> **唯一正本**(2026-09-02 起;同目录 `AGENTS.md` 是指向本文件的软链,两个代理读同一份)。
> 主工作树 `line_math/Raccord/` 停在 **`main`**;`Raccord-发布/` worktree 已撤销。
> 本文 2026-08-26 随拆仓写成,2026-09-02 AI 协作债清理:删黑客松材料、链上残留、照片注入链路、103 张无引用 QA 截图,交接单归档。

本仓是 **Raccord** 的代码仓，班级网站由独立的 `rucmathclass` 仓库维护。2026-09-27 核查时 Raccord 尚未首发，域名仍跳回班级站。当前发布脚本固定目标 `/var/www/raccord/dist`，Worker 目标为 `raccord-ai`，数据库也必须独立。先读代码和现场判断运行状态；本文和旧 SQL 都不能代替实际核验。边界与发布步骤见 [部署说明](deployment/RACCORD_DEPLOY.md)。

## 产品意图正本

- 产品宪法是 [`docs/design/product-constitution.md`](docs/design/product-constitution.md)。它规定判断、删减与演化原则；与旧设计研究的产品意图冲突时，以宪法为准。
- 作者身份转向期同时遵守 [`docs/design/author-work-transition-resolution.md`](docs/design/author-work-transition-resolution.md)：涉及作者与班级边界、思想化身真实性、章节制及“是否必须共享同一对象”的判断，以该临时决议为准；具体人物与场景仍须原型验证，尚未写入正式宪法。
- 领域语言见 [`CONTEXT.md`](CONTEXT.md)。本站当前称“作者作品”，数学班是“出生坐标”；禁止再把它默认描述为代表班级集体意志的“班级官网”。
- 三世界不是三个固定功能部门，而是当前使用的三种表现形式。它们可以换题材、对象、动作和媒介；现有路由与内容分工只描述当前实现，不构成永久产品定义。
- 美是产品价值，不是功能外皮。一个体验可以改变共享对象，也可以只留下真实的感知、理解或记忆余韵；但不能既无对象、也无余韵，只靠功能数量或视觉新鲜感成立。

## 当前产品状态（2026-07-23）

- React 18 + React Router 7 + Vite 5 静态 SPA，Supabase anon client + RLS。
- **第一章《Le ciel de Poincaré》已获作者认可成立**（2026-07-23，轻量认可，见转向决议附记）：三界共享 `localStorage.poincare_sky_v1` 的 seed / memory / scar 命运对象，通行过场由共享 signature 驱动。隐晦语法（Carnet 驻留显影、Limite 长按加载）是有意保留的赌注，不加提示。`Raccord 01` 依决议第八条封存为实验档案，代码保留。
- 当前三条 world key / 路由仍为 `carnet`、`plan`、`limite`。本期分别采用纸页、工程图和暗色仪器的表现语言；三者不得复用同一首页内容模板，但这些语言与内容归属可以在后续 edition 中演化。
- 桌面端与移动端是两条独立体验线，只挂载当前 viewport 对应的 DOM；共享层只放 domain data、world state、SRS/API 与 `components/material` primitives。禁止同时渲染双端后用 CSS 隐藏，也禁止把桌面侧栏/双栏仅靠 media query 压成手机。
- **站名 `Raccord`**（2026-07-23 拍板）：wordmark、`<title>` 与 og 元数据均为 Raccord；章节名保留法语。**站面不出现作者姓名与班级信息**（同日作者点名撤回落款）：无页脚署名，meta/og 不含个人或班级字段；既有工具层班级资料页除外。不得回退为「班级官网」措辞。
- 世界状态写入 `localStorage.carnet_world`，首访入口使用 `localStorage.carnet_visited`，根节点为 `<html data-world>`.
- 当前 edition 以同一件 `Raccord 01` 连续曲线贯穿三界：PLAN 用 Bézier 控制柄把两段曲线从 G⁰ 接向 C²；Carnet 以 Cauchy / Bergson 的边注追问连续与同一；Limite 把同一曲线置于 A350 / 航空连续曲率启发的无量纲载荷试验中。当前关系是「PLAN 构造 → Limite 施压 → Carnet 留痕与提问 → 返回 PLAN」，不是三项强制流程。
- `Raccord 01` 的 Bézier 控制柄是三界共享且持久化的对象（`localStorage.raccord_artifact_v1`），不是三张相似插图：PLAN 改动后，Carnet 与 Limite 必须读取同一组坐标。数值读取、边界归一化和飞行载荷都在 `components/material/raccordWorldMath.js` 保持为可测试纯函数。
- PLAN 的 Atlas / Chantier、Carnet 的 archives / register 与站点级 Vocabulary 继续存在于深层工具路由，不与首页中心对象争抢首屏；Assistant 只在具体学习失败后作为上下文动作出现。
- `/testimonials` 路由与独立 `testimonials` 表继续存在，但页面已降为只读「来源附录」：已验证技术痕迹与未验证用户记录分开，编辑样例不渲染，不再提供新留言界面。
- Web3 前端已退役。`programs/class-anchor/`、Anchor 文档与 devnet memo 导入脚本已于 2026-09-02 删除(历史在 git);不得重新接回钱包、Solana 依赖或链写入 UI。唯一的链上寄语已固化在 `src/data/testimonialArchive.js`。
- `/vocabulary` 的 SRS、词库真相源与 `/assistant` 的 Cloudflare Worker 保持原管线；管线存在不等于产品核心地位，背词默认是工具，AI 默认退到具体对象之后。

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

- 班级站保留原库；Raccord 使用独立项目，不复制账号和个人记录。客户端只读取 `VITE_RACCORD_SUPABASE_*`，拒绝已知班级站地址。
- 新库初始化见 `sql/initialize_independent_database.sql`，已有目标表时脚本会停止。根目录旧 SQL 不作为新库安装或迁移顺序；线上状态仍需实际查询。
- 新库的个人表按账号隔离。`comments` 只承载资源增补私有队列，匿名用户不能读；`album_id = 0` 和 `__mathclass_ops__::` 是现有协议，不是恢复相册的依据。普通用户不能写审核回执。
- 注册只创建普通角色，前端不能修改角色。公开书目由管理员写入，来源附录仅开放读取；不因旧函数存在而增加入口。
- Gemini / ElevenLabs key 只放独立 Worker 的 secret，绝不进入前端。当前 Worker 缺少登录校验，打包通过不代表已具备上线条件。

## 视觉约束

- 只允许一个强调色，且必须和底色同温度。
- 当前 Carnet 谱系：`#fbfaf6 / #201d1a / #7f302b`，EB Garamond + Noto Serif SC 400，象牙纸、无框表单与发丝线。
- 当前 PLAN ℝ 谱系：`#efede6 / #171716 / #2e3fbd`，只在每屏主标题使用 Archivo 900，正文使用 400/500/600；本期保留方格与制图结构。
- 当前 Limite 谱系：`#12100e / #e9e3d9 / #d9614d`，Archivo 500/600 + JetBrains Mono，红只作活性信号，不再把整页变成告警面板。
- 每屏一个主视觉重心；不要把正文装进通用圆角卡片。
- Enter 与三世界所有材质变化连续、可逆、低噪声；pointer 停则插值完成后停帧，离开/松手沉睡；scroll 只负责 dormant→awakened。不要粒子、大面积 glow、普通 hover 放大、廉价毛玻璃或永续 RAF。
- Claude 设计稿继续作为当前 edition 的色调、字体、字重、发丝线与异质响应基线，不是永久内容宪法；旧稿的五项统一导航、解释性长文、假朗读、三世界重复同一今日页和 AI 冻结条款已被后续用户决策覆盖。

## 部署

只运行本仓 `bash deploy.sh`，默认离线检查。使用 `RACCORD_DEPLOY_HOST`、`RACCORD_DEPLOY_USER`、`RACCORD_DEPLOY_SSH_KEY`；目录固定，旧的 `MATHCLASS_DEPLOY_*` 不再采用。脚本校验仓库、分支、独立数据库和构建标记，具体见 `deployment/RACCORD_DEPLOY.md`。

没有用户明确授权，不执行 `--publish` 或发布 Worker。部署后核对 Raccord 域名与带正确 Host 的源站响应，以及 `health.json` 的 `app: Raccord` 和本次 buildTime；直接访问服务器 IP 可能进入班级站的默认站点，不能作为 Raccord 验收。

## 分支现状(2026-09-02)

- `main`:正本与部署源,与 origin 同步。
- `wip/horizon-immobile`(08-10):第二章《L'horizon immobile》Foucault 摆组件 + Horizon 页,约 3400 行,**唯一副本**,含两份对应交接单与 `docs/design/foucault/directions/` 方向稿。落后 main 4 个提交。
- `codex/world-chapter-constitution`(08-10):产品宪法 v2 + 章节制作协议的文档快照,与 wip 互不包含。
- 两条是同一章的两版:wip = Fable 的 Foucault 摆原型,codex = GPT 的宪法 v2 + 大铜球候选(codex 自己的 AGENTS 已写明该表面未获认可)。作者 09-02 回忆:**两版都不太满意,未拍板**。08-06 起暂缓;裁定前不合并、不删除,具体开发不在线级做。

## 文档导航

- `docs/INDEX.md` —— 文档导航(现行 / 归档分开)
- `docs/archive/handoff-2026-07/` —— 07-23 交接单与 design-qa,目标路径已失效,只作历史
