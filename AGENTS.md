# AGENTS.md — MathClassWebsite-public

本仓是 math 主线唯一活跃代码仓与 `rucmathclass.com` 的构建来源。改代码、提交、部署只在这里进行；兄弟仓 `MathClassWebsite` 已归档，只作为私有班级照片源。

## 产品意图正本

- 产品宪法是 [`docs/design/product-constitution.md`](docs/design/product-constitution.md)，当前为 **Raccord 产品宪法 v2.0**。它规定判断、删减与演化原则；与旧设计研究的产品意图冲突时，以宪法为准。
- [`docs/design/author-work-transition-resolution.md`](docs/design/author-work-transition-resolution.md) 继续作为作者身份、班级边界与思想化身真实性的历史依据；其中“正式修宪暂缓”的阶段已于 2026-07-29 结束。
- 新章节的候选、原型、访客验证与 canon 顺序见 [`docs/design/chapter-making-protocol.md`](docs/design/chapter-making-protocol.md)。它是可演化制作协议，不得反过来把宪法变成流水线。
- 领域语言见 [`CONTEXT.md`](CONTEXT.md)。本站当前称“作者作品”，数学班是“出生坐标”；禁止再把它默认描述为代表班级集体意志的“班级官网”。
- **世界持续存在，章节在其中发生。** 世界拥有自身时间、记忆、材料与法则，不是栏目或主题皮肤；章节是世界生命中的一次事件，不取代世界，也不强制穿过三界。
- PLAN、Le Carnet、Limite 是当前作品中的三个世界。它们可以换题材、对象、动作和媒介，也可以沉睡；现有路由与内容分工只描述当前实现，不构成永久分类。
- Enter 是进入世界的序章门槛，不是功能门户或章节总目录。章节档案、实验档案与工具应另有安静入口，不得把 Enter 填成导航墙。
- 美是产品价值，不是功能外皮。一个体验可以改变共享对象，也可以只留下真实的感知、理解或记忆余韵；但不能既无对象、也无余韵，只靠功能数量或视觉新鲜感成立。

## 当前产品状态（2026-07-29）

- React 18 + React Router 7 + Vite 5 静态 SPA，Supabase anon client + RLS。
- **第一章《Le ciel de Poincaré》已获作者认可成立**（2026-07-23，轻量认可，见转向决议附记）：三界共享 `localStorage.poincare_sky_v1` 的 seed / memory / scar 命运对象，通行过场由共享 signature 驱动。隐晦语法（Carnet 驻留显影、Limite 长按加载）是有意保留的赌注，不加提示。`Raccord 01` 依决议第八条封存为实验档案，代码保留。
- 第一章按当时口径获得轻量认可并作为既有 canon 保留；v2.0 的完整作品闸门适用于此后候选章节，不追认第一章已经完成后来新增的全部验证。
- 当前三条 world key / 路由仍为 `carnet`、`plan`、`limite`。本期分别采用纸页、工程图和暗色仪器的表现语言；三者不得复用同一首页内容模板，但这些语言与内容归属可以在后续 edition 中演化。
- 桌面端与移动端是两条独立体验线，只挂载当前 viewport 对应的 DOM；共享层只放 domain data、world state、SRS/API 与 `components/material` primitives。禁止同时渲染双端后用 CSS 隐藏，也禁止把桌面侧栏/双栏仅靠 media query 压成手机。
- **站名 `Raccord`**（2026-07-23 拍板）：wordmark、`<title>` 与 og 元数据均为 Raccord；章节名保留法语。**站面不出现作者姓名与班级信息**（同日作者点名撤回落款）：无页脚署名，meta/og 不含个人或班级字段；既有工具层班级资料页除外。不得回退为「班级官网」措辞。
- 世界状态写入 `localStorage.carnet_world`，首访入口使用 `localStorage.carnet_visited`，根节点为 `<html data-world>`.
- `Raccord 01` 已退出当前首页。其 `raccord_artifact_v2` 状态、数学与材质代码只作为实验档案实现保留；正式“可进入档案”入口尚未完成，不得把它描述为当前 edition。
- **第二章候选《L’horizon immobile》尚未进入 canon。** “观察者失去静止特权、一次选择后世界继续、回来时证据累积”是可保留命题；大铜球、石厅、拖拽与背景偏转的现有表面未获作者认可，不得继续当作选定方向或建立正式入口。
- 当前 `/` 仍直接装配第一章三幕；章节档案、实验档案与工具总入口尚未形成。第二章成立前不要先造通用 CMS，但新代码不得继续把每章写成无边界的路由特例。
- `/vocabulary`、`/assistant`、`/resources`、`/atelier` 等能力属于工具层。Assistant 只在具体学习失败后作为上下文动作出现；工具访问不得无理由改写用户所处世界。
- `/testimonials` 路由与独立 `testimonials` 表继续存在，但页面已降为只读「来源附录」：已验证技术痕迹与未验证用户记录分开，编辑样例不渲染，不再提供新留言界面。
- Web3 前端已退役。`programs/class-anchor/` 与 Anchor 文档只作历史，不再 build/deploy；不得重新接回钱包、Solana 依赖或链写入 UI。
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

- 本仓与归档仓共用 Supabase 项目 `xfwkjhajrqxsakzovcwx`；RLS 是唯一安全边界。
- 权威 RLS 状态是 `harden_rls.sql`。新增表/策略时同步其独立 setup 脚本与 `harden_rls.sql`。
- 寄语簿首次上线前执行 `setup_testimonials.sql`；未执行时前端必须只读降级。
- `comments.album_id = 0` 是 ops queue；`__mathclass_ops__::` 审核回执属于“文本当协议”，不得放松 moderation 双守卫。
- `comments.user_email` 对 anon 遮蔽；查询必须显式列名，禁止 `select('*')`。
- 角色提升只允许 `super_admin`，继续通过 `public.is_super_admin()` 的 security-definer 边界。
- Gemini / ElevenLabs key 只放 Cloudflare Worker secret，绝不进入前端环境变量或产物。

## 视觉约束

- 只允许一个强调色，且必须和底色同温度。
- 当前 Carnet 谱系：`#fbfaf6 / #201d1a / #7f302b`，EB Garamond + Noto Serif SC 400，象牙纸、无框表单与发丝线。
- 当前 PLAN ℝ 谱系：`#efede6 / #171716 / #2e3fbd`，只在每屏主标题使用 Archivo 900，正文使用 400/500/600；本期保留方格与制图结构。
- 当前 Limite 谱系：`#12100e / #e9e3d9 / #d9614d`，Archivo 500/600 + JetBrains Mono，红只作活性信号，不再把整页变成告警面板。
- 每屏一个主视觉重心；不要把正文装进通用圆角卡片。
- Enter 与三世界的局部材质响应连续、可逆、低噪声；pointer 停则插值完成后停帧，离开/松手沉睡；scroll 只负责 dormant→awakened。若自主运动、真实经过时间或离开后的累积本身就是作品法则，可以继续，但必须有明确理由、诚实可恢复的状态与减弱动态方案。不要粒子、大面积 glow、普通 hover 放大、廉价毛玻璃或无意义的永续 RAF。
- Claude 设计稿继续作为当前 edition 的色调、字体、字重、发丝线与异质响应基线，不是永久内容宪法；旧稿的五项统一导航、解释性长文、假朗读、三世界重复同一今日页和 AI 冻结条款已被后续用户决策覆盖。

## 部署

只运行本仓 `./deploy.sh`。它从兄弟仓固定 commit `a88bdc5` 注入私有照片、构建并 rsync 到 VPS。绝不运行 `MathClassWebsite/deploy.sh`。

部署后检查 `health.json` 的新 buildTime，并比较域名与 `http://149.28.69.75/health.json`。没有明确请求时不要自行部署。
