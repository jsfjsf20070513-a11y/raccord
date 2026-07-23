# 三世界重构研究记录 · 2026-07-12

> **状态：历史方案。** 本文记录 2026-07-12 的实现分区与视觉研究；其中 PLAN=资源、Carnet=档案、Limite=背词/AI 的固定定位已被 [`product-constitution.md`](product-constitution.md) 覆盖，不再具有产品宪法效力。双端独立挂载、真实数据、安全边界、单一重心与低噪声材质原则继续有效。

## 结论先行

三世界不再共享一张「首页模板」，只共享真实数据、世界状态和低噪声材质机制。

| 世界 | 用户来这里做什么 | 核心回访理由 | 不属于这里的内容 |
|---|---|---|---|
| PLAN ℝ | 定位、选路、共建公开知识索引 | 学习路径与资源地图持续变清楚 | 寄语、班史、背词、AI 对话 |
| Le Carnet | 读今天的一页，并沿时间回到过去 | 每日编成页、证明、照片、寄语与书签 | 资源目录、训练仪表、AI |
| Limite | 测量、练习、诊断、修正 | 到期复习、弱项变化、AI 辅助解释 | 班史、纪念性长文、资源书架 |

桌面与移动是两条独立体验线：只挂载当前 viewport 对应的 DOM，分别维护构图、导航、交互和节奏；不同时渲染两套页面再用 CSS 隐藏。共享层只保留 domain data、SRS/API、world state、pointer field 与 Canvas material primitives。

## Enter 视觉审计

当前实现已保留 Claude 稿最重要的黑色坐标纸、Archivo 重标题、三张异质海报与三种 pointer 响应，也已经删除「读/做/看」等解释性文案。

当前基线的主要问题：

- 桌面 1440×900 下主标题与海报组各自成立，但标题从左边界起、海报组在中部，两个重心没有形成同一条构图轴；海报在中等桌面宽度会被 `13.4vw` 压到约 161px 高，失去 Claude 原稿的实体感。
- 1200×820 下标题占用过多垂直重量，而删除副文案后没有重新分配上下留白，导致标题和海报像两个贴在画布上的区块，而不是连续节奏。
- 移动端仍是桌面 DOM 的媒体查询压缩：标题存在横向裁切风险，三张 300px 海报机械纵排，第一件器物与后两件的翻阅节奏弱；触控反馈仍主要继承 pointer/focus 逻辑。
- 因此 Enter 需要保留 Claude 的色调与字重，但桌面、移动分别编排；移动端不能只靠桌面媒体查询。

本轮 current-run 截图保存在本机 QA 临时目录 `/tmp/math-worlds-audit-2026-07-12/`，包含 Claude Enter 对照、当前桌面 1440×900、当前 1200×820、当前移动 390×844。

## PLAN ℝ · 公开工程图

### 定位

PLAN 是班级的 operating drawing，而不是另一张书页。用户完成三个动作：

1. `Coordonnées`：用真实聚合数字理解「这是谁」。
2. `Atlas`：从任务路径进入资源，而不是浏览 77 条平铺书架。
3. `Chantier`：推荐资源、修订路径、维护公开索引。

现有数据只支持 8 个资源类别和真实条目，不支持伪造二维知识地图、实时协作人数或个人坐标。第一版 Atlas 应诚实地做类别与任务路径；补齐难度、语言、媒介、前置关系后再升级为真正的知识图。

### 双端

- Desktop：92–100svh 的单一工程封面；下沿露出下一段；Atlas 用左侧坐标索引 + 右侧有限条目；Chantier 只有一个明确资源推荐入口。
- Mobile：72–78svh 的独立封面，标题拆成 `PLAN / ℝ`；三段改为大触控行；Atlas 使用纵向 progressive disclosure，不做桌面侧栏的压缩版。

### 机制

Pointer 只局部加深网格、吸附交点并显示极小坐标读数；不 scale、不 lift、不 glow。Scroll 只设置 section 的 dormant→awakened。停止输入后完成插值即停止帧循环，离开后衰减并沉睡。

参考机制：[Apple Design Principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)、[Apple Layout](https://developer.apple.com/design/human-interface-guidelines/layout)、[Apple Motion](https://developer.apple.com/design/human-interface-guidelines/motion)、[Apple Pointing Devices](https://developer.apple.com/design/human-interface-guidelines/pointing-devices)、[Apple Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)、[Apple Scroll Views](https://developer.apple.com/design/human-interface-guidelines/scroll-views)、[Contra Discover](https://contra.com/discover)、[Swiss Design Awards](https://swissdesignawards.ch/en/about)。

## Le Carnet · 今天的一页，以及可以回到过去的一册

### 定位

Le Carnet 不是普通博客或 24 条 accordion。它提供三种时间尺度：

- 90 秒：一条定理、一句思想或一个班级瞬间。
- 10 分钟：双语证明与相关记忆。
- 数月以后：沿日期、主题、人物或媒介返回档案。

顶层只保留 `Aujourd’hui / Archives / Registre`。Archives 再沿 `Temps / Notions / Voix / Images` 四条轴进入。每件档案需要稳定地址、前后页、相关材料与本地书签。

### 双端

- Desktop：打开的双页刊物，中轴是实际书脊；左页放低对比记忆/照片，右页只放一个今日主焦点；下滚才进入证明与关联档案。
- Mobile：独立单页 folio，一次只读一件；照片是下一叶；双语证明顺排或显式切换；轻量页码轨道替代顶部栏目堆积。

### 机制

Pointer 只局部提高纸纤维、压印边缘、墨色密度；标题下划线从中轴向两侧生长。不留墨迹轨迹。移动端按压点作为局部压力，松手沉睡，且核心内容不依赖触摸效果才能发现。

参考机制：[Anthropic — Claude is a space to think](https://www.anthropic.com/news/claude-is-a-space-to-think)、[BnF — Les Essentiels](https://expositions.bnf.fr/montesquieu/a-propos.htm)、[Gallica 检索与阅读](https://gallica.bnf.fr/accueil/fr/html/aide-a-la-recherche)、[Claude Projects](https://support.claude.com/en/articles/9517075-what-are-projects)、[Claude Artifacts](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)。

## Limite · 测量、练习、诊断与修正

### 定位

Limite 是三世界的现在时。首页只回答：今天有多少内容到期、最近哪里最弱、现在继续练习还是进入助手。主视觉是一件可触摸收敛仪器；`Vocabulaire` 是主工作站，`Assistant` 是诊断工作站。

### Vocabulary

真实资产是 3652 条 A1–C2 词、SRS、六种练习、发音、错词重练与账号同步。现有问题不是能力少，而是把最多 48 个预习/复习项目、184 个细标签和全部设置压在同一流程。

新结构：

1. `À faire`：今日到期 + 少量新词。
2. `Faiblesses`：上次答错与低阶段词。
3. `Mathématiques`：数学与专业术语族。
4. `Libre`：级别、主题搜索与细标签。

学习节奏改为 `Calibration → Acquisition（只预习新词）→ Épreuve → Trace → Reprise`。错误反馈提供 `Indice / Expliquer / Continuer`；`Expliquer` 把当前词、例句与用户答案带入 Assistant。

### Assistant

保留中法双语、KaTeX、拍题、最近上下文与账号历史；把通用聊天皮肤改成 `Banc de diagnostic`，只保留 `Guider / Expliquer / Vérifier` 三种工作模式。第一阶段真实实现公式工作台、题图查看、词汇上下文、可中止请求与明确状态；当前 Worker 只返回文本，因此不伪造 Artifacts。

### 双端与机制

- Desktop：Vocabulary 只有一个中央刺激区；Assistant 初始单栏，有公式/题图后才渐进打开工作台。
- Mobile：一题一个视口、44px 以上触控区、页面自身单一滚动、composer 位于安全区上方；筛选/模式用底部 sheet，不压缩桌面侧栏。
- 收敛语义统一为 `progress = 1 - 2 × |u - 0.5|`，越靠近中轴越接近极限。Pointer 停，波形停；离开睡眠；scroll 不驱动数学状态。

参考机制：[Claude for Education](https://www.anthropic.com/news/introducing-claude-for-education)、[Claude Education](https://claude.com/solutions/education)、[Claude inline visuals](https://claude.com/resources/tutorials/imagine-with-claude-student-guide)、[Apple Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)、[Apple Motion](https://developer.apple.com/design/human-interface-guidelines/motion)、[Duolingo adaptive lessons](https://blog.duolingo.com/keeping-you-at-the-frontier-of-learning-with-adaptive-lessons/)、[Duolingo Practice Hub](https://blog.duolingo.com/guide-to-duolingo-practice-hub/)。

## Claude 设计宪法的继承与覆盖

继续继承：

- PLAN：冷骨白、墨黑、钴蓝、Archivo 900、工程网格与巨幅 ℝ。
- Carnet：象牙纸、氧化红、EB Garamond/Noto Serif SC、中轴、发丝线与 oldstyle 数字。
- Limite：暖近黑、骨白、朱红、Archivo/JetBrains Mono、中轴与收敛信号。
- 每屏一个主焦点、解释文字能减则减、功能找到诚实文体。

由本轮用户新决策覆盖：

- 旧 brief 的「AI 助手冻结」不再成立；体验与 Vocabulary 联动可以重构，但现有 Worker 安全边界保持。
- 旧稿的五项统一导航、三世界重复同一今日页、假朗读、持续 RAF、typewriter、普通 hover 放大和大面积 glow 不再保留。
