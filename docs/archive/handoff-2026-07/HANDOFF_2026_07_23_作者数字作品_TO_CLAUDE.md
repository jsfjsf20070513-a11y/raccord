# HANDOFF｜作者数字作品 → Claude

> 日期：2026-07-23  
> 目标仓库：`/Users/jinshuopeng/Desktop/💻 Workspace/代码_三主线/math_网站/MathClassWebsite-public`  
> 接手者：Claude / Claude Code  
> 当前性质：创作现场交接，不是发布单，不授权 commit、push、PR、merge 或生产部署  
> 本文件应随当前作者作品重构任务入库；在用户明确授权提交前，它和其余改动一样留在当前 WIP 工作树

---

## 0. Claude 收到本文件后的第一轮动作

严格按以下顺序执行。顺序的理由是：当前工作树包含数日累计、尚未提交的大量视觉与架构改动；先整理 Git 或重新设计，都会把真实创作现场覆盖掉。

1. **只读确认现场，不改文件。**
   - `pwd`
   - `git branch --show-current`
   - `git rev-parse --short HEAD`
   - `git status --short`
   - `git diff --check`
2. **完整阅读权威文档。**
   - `AGENTS.md`
   - `CONTEXT.md`
   - `docs/design/product-constitution.md`
   - `docs/design/author-work-transition-resolution.md`
   - `/Users/jinshuopeng/Desktop/审美偏好.md`
   - 本 HANDOFF
3. **打开视觉真相源。**
   - `docs/design/poincare/selected-option-2.png`
   - `docs/design/poincare/qa/comparison-continuity-final.jpg`
   - `design-qa.md` 中 `Le ciel de Poincaré` 的两节
4. **复现当前体验。**
   - 若 5174 端口已有服务，复用，不要重复启动。
   - 否则运行：

     ```bash
     npm run dev -- --host 0.0.0.0 --port 5174 --strictPort
     ```

   - 打开 `http://127.0.0.1:5174/`。
   - 桌面 1440×1024、移动 390×844 各走一遍：
     `PLAN → Carnet → Limite → PLAN`。
5. **第一轮只向用户汇报以下四项，不自行扩写产品。**
   - 已读到的作品身份；
   - 当前 Git/工作树状态；
   - 当前第一章能否复现；
   - 下一步准备做什么、明确不做什么。

在用户给出下一条创作指令前，不新增人物、不写第二章、不修宪、不部署。

---

## 1. 撞车警告

### 1.1 当前工作树不是干净分支

- 当前分支：`wip/worlds-recueil-testimonials-2026-07`
- 当前 HEAD：`d683054`
- HEAD 信息：`WIP: web3 layer removal + worlds/recueil/testimonials direction`
- 当前存在大量 modified 与 untracked 文件。
- 这批文件不是垃圾，也不是可随意清理的生成物；它们包含：
  - 作者作品转向治理；
  - Enter 双端重构；
  - 三世界双端组件树；
  - Poincaré 第一章；
  - Recueil / Resources / Testimonials / Vocabulary 等深层页面重构；
  - 测试与设计 QA。

### 1.2 接手时禁止的 Git 动作

在用户点名授权前，禁止：

- `git checkout main`
- `git pull`
- `git reset --hard`
- `git checkout -- <file>`
- `git clean`
- stash 后切线
- rebase
- force-push
- 把 untracked 目录当作“临时文件”删除
- 为了让状态好看而重建分支或重放提交
- `git add -f`

如果发现文件在接手期间被其他代理或用户改变，**停止写入并重新做状态审计**，不要静默覆盖。

### 1.3 单写者原则

同一工作树同一时刻只允许一个写者。若 Claude 接手，Codex/其他代理不再同时写这个目录。需要并行时，先由用户明确分配独立 worktree/分支，不在当前脏树并写。

---

## 2. 一句话作品定义

这不是“数学班需要的网站”，也不是 AI、留言、背词、资源导航的功能平台。

它是一件诞生于中国人民大学中法学院 2025 级数学班的、持续生长的作者数字作品：以数学、法国哲学、航空航天、材质、时间和交互构成可进入的章节。

班级是**出生坐标**，不是甲方，也不授予作者代表全班审美或意志的权利。

---

## 3. 当前创作北极星

以下是已收敛的工作方向，但不是全部已经写入正式宪法的永久 canon：

1. 网站最终应像一本会记忆的手稿、一座遵循数学规律的神话剧场、一台由数学、哲学与航空共同制造的思想机器。
2. 作品以“章节”生长，不以功能栏目生长。
3. 每章围绕：
   - 一位思想化身；
   - 一个核心矛盾；
   - 或一次不可替代的相遇。
4. 数学家、哲学家、工程师与飞行者“复活”的是思想、问题、方法与精神张力，不是假装还原本人。
5. 人物首先通过世界法则说话：
   - 庞加莱通过初始条件与不可预测性；
   - Bergson 通过时间与记忆的材料行为；
   - Cauchy 通过尺度、邻域与连续性；
   - 航空通过不可逆、载荷与连续曲率。
6. 聊天框、人物卡、生平、仿古台词、万能 AI NPC 都不是默认形式。
7. 访客不必第一次理解全部思想，但必须能感到：
   - 自己触碰了什么；
   - 世界为何回应；
   - 这次行为留下了什么后果。

### 3.1 尚未正式拍板

不得替用户擅自决定：

- Poincaré 是否成为正式 canon 第一章；
- 是否修订正式《三世界产品宪法》；
- 网站最终是否继续叫 `Carnet de classe`；
- 三个世界是否永久保留当前名称与数量；
- 第二章人物；
- 是否以及如何引入受约束的生成式对话；
- 何时公开发布。

工程和视觉 QA 已通过，不等于用户已经授权“正式修宪”。

---

## 4. 三世界的当前含义

三个世界不是知识分类，也不是三个功能部门。它们是作者观看同一问题的三种空间。

### PLAN ℝ

- 倾向：秩序、数学、构造、理性、工程。
- 当前材料：骨白工程浮雕、钴蓝坐标/轨迹。
- 当前主动作：抓取并改变初始条件。
- 当前余韵：极小变化会进入对象的后续命运。

### Le Carnet

- 倾向：语言、记忆、哲学、时间。
- 当前材料：象牙纸、纤维、闭眼面孔、暗酒红痕迹。
- 当前主动作：驻留，让历史痕迹显影。
- 当前余韵：对象经历过什么，会留在纸上。

### Limite

- 倾向：飞行、边界、风险、远方。
- 当前材料：暖黑气动/天体曲面、骨白与朱红轨迹。
- 当前主动作：按住推进时间与载荷。
- 当前余韵：越过阈值会留下不可逆伤痕。

这些只是当前 edition 的形式，不得反向冻结未来内容。

---

## 5. 当前第一章成果：Le ciel de Poincaré

### 5.1 视觉方向

用户从三个独立视觉方向中选择了方向二：**沉睡的几何学家**。

视觉真相源：

```text
docs/design/poincare/selected-option-2.png
```

三件已生成并接入的 raster relief：

```text
public/assets/poincare/plan-relief.png
public/assets/poincare/carnet-relief.png
public/assets/poincare/limite-relief.png
```

最终并排 QA：

```text
docs/design/poincare/qa/comparison-continuity-final.jpg
```

### 5.2 三幕机制

1. PLAN
   - 访客拖动 seed；
   - 生成确定性的轨迹；
   - 提交后写入 manuscript memory。
2. Carnet
   - 读取同一 seed；
   - 驻留后显示历史轨迹；
   - 显示从 Limite 返回的 scar。
3. Limite
   - 按住推进时间；
   - 两条邻近轨迹逐渐分离；
   - 首次越过阈值写入不可逆 scar；
   - 后续越界继续计数，但第一道 scar 不被覆盖。
4. 世界通行
   - 同一条 normalized signature 从旧材质浮起；
   - 在 source/target 两界的真实位置、振幅、色彩之间连续形变；
   - 目标世界在过场中暂时让自身 Canvas 沉睡，避免双曲线叠影；
   - 过场结束后由新材质接管。

### 5.3 数学诚实性

- 使用确定性的 Rössler flow，表达 sensitive dependence。
- 它是紧凑、可控的交互原型，不是假装重建庞加莱的三体计算。
- 代码注释和 QA 已明确这一边界。
- 不得在文案中把它冒充“庞加莱三体问题精确模拟”。

### 5.4 持久化

```text
localStorage.poincare_sky_v1
```

核心 artifact：

- `seed`
- bounded `memory`（最多 7 条）
- `thresholdCrossings`
- irreversible first `scar`

三界必须始终读取同一 artifact。遮住名称和配色后，它们仍应通过不同动作与材料行为成立。

---

## 6. 代码地图

### 6.1 作品装配

```text
src/pages/Home.jsx
```

- 读取 current world；
- 挂载 desktop 或 mobile 世界首页；
- 装配 `usePoincareSky()`；
- 管理 `PLAN → Carnet → Limite → PLAN`；
- 管理有限时长的 passage。

不要把数学、存储或 Canvas 细节重新塞回 `Home.jsx`。

### 6.2 纯数学

```text
src/components/material/poincareSkyMath.js
src/components/material/poincareSkyMath.test.js
```

重要导出：

- `normalizePoincareSeed`
- `createPoincareSky`
- `createPoincareSignature`
- `separationAtProgress`

`createPoincareSignature` 是三界共享同一轨迹身份的关键。不得让三个场景重新各自采样“相似曲线”。

### 6.3 状态

```text
src/components/material/poincareSkyState.js
src/components/material/poincareSkyState.test.js
src/components/material/usePoincareSky.js
```

状态更新通过事件：

- `seed.changed`
- `seed.committed`
- `threshold.crossed`

新增事件时，先写纯状态转移与测试，再接 UI。

### 6.4 三件材料器物

```text
src/components/material/PoincarePlanField.jsx
src/components/material/PoincareCarnetField.jsx
src/components/material/PoincareLimitField.jsx
src/components/material/PoincareSkyFields.css
```

职责：

- PLAN：拖动 seed、局部网格 proximity、工程轨迹与 scar 切口；
- Carnet：驻留显影、manuscript memory、纸面 origin mark 与 scar；
- Limite：press-and-hold 时间加载、阈值、分离与 scar；
- CSS：只负责真实 raster relief 的定位和低噪声排版，不伪造新插画。

### 6.5 通行

```text
src/components/material/PoincarePassageField.jsx
src/components/material/PoincarePassageField.css
src/experiences/desktop/PoincarePassageDesktop.jsx
src/experiences/mobile/PoincarePassageMobile.jsx
```

共享层只画对象 signature；桌面/移动各自拥有 wrapper、视口高度与布局。

### 6.6 桌面/移动独立线

```text
src/experiences/desktop/worlds/
src/experiences/mobile/worlds/
src/experiences/desktop/PoincareChapterDesktop.css
src/experiences/mobile/PoincareChapterMobile.css
```

禁止把两套 DOM 同时渲染后用 CSS 隐藏，也禁止只用 media query 把桌面页压成手机。

### 6.7 Enter

```text
src/pages/Enter.jsx
src/pages/Enter.css
src/experiences/desktop/EnterDesktop.jsx
src/experiences/mobile/EnterMobile.jsx
src/components/material/WorldPortalCard.jsx
src/components/material/WorldMaterialField.jsx
src/components/material/usePointerField.js
src/components/material/ScrollAwaken.jsx
```

Enter 已是作品语言的一部分。不要回退为三张普通导航卡。

---

## 7. 视觉与交互口径（实现须逐条一致）

### 7.1 全局

1. 先服从“不乱”：层级、对齐、留白、节奏优先。
2. 构图倾向居中、平衡、主体落中轴。
3. 配色低饱和、克制；一屏只允许一个强调色。
4. 不要粒子。
5. 不要大面积 glow。
6. 不要普通 hover 放大。
7. 不要廉价毛玻璃。
8. 不要花哨永续动画。
9. 不要 emoji 充当视觉资产。
10. 不要通用圆角卡片把世界装成 dashboard。
11. 文字能减则减，不用长解释补机制的不清楚。

### 7.2 材质响应

1. 所有变化连续、可逆、低噪声。
2. pointer 停止后，材质完成必要插值便停帧。
3. pointer 离开/松手，材质沉睡。
4. scroll 只负责 dormant → awakened。
5. PLAN = 抓取；
6. Carnet = 驻留；
7. Limite = 按住。
8. 三界不能共享一套换皮 hover。

### 7.3 参考机制，不复制视觉表面

- ContraLabs：学习作品展示节奏；
- Wild Week Athens：学习 illustration → relief → mask/normal → component → layout 的工作流；
- moss/tree：学习 proximity field；
- Apple / Claude：学习低噪声光影和克制动效；
- A350 / 787：学习连续曲率、无硬切和平滑过渡。

不得把参考网站的视觉表面直接搬入本项目。

### 7.4 字体与色彩

- PLAN：`#efede6 / #171716 / #2e3fbd`
- Carnet：`#fbfaf6 / #201d1a / #7f302b`
- Limite：`#12100e / #e9e3d9 / #d9614d`
- 章节标题：EB Garamond italic；
- 小型计量：JetBrains Mono；
- Archivo 900 只在 PLAN 主标题确有必要时出现，不要把全站重新变成粗体。

---

## 8. 真实性与内容红线

以下来自仓内权威文档，必须原样理解：

> 本站当前称“作者作品”，数学班是“出生坐标”；禁止再把它默认描述为代表班级集体意志的“班级官网”。

> 三世界不是三个固定功能部门，而是当前使用的三种表现形式。

> AI、留言、背词、搜索、账号和统计都没有天然的存在权，更不能因为已经实现就成为世界中心。

> 不伪造实时性、智能、共同体、实验结果或知识深度。

人物相关：

- 历史原文必须可核验并标明出处；
- 思想转述必须忠于原意，并明确是作品概括；
- 作品语言不得冒充历史名言或人物原话；
- 不得声称 AI 就是历史人物本人；
- 不得伪造史料、书信、实验结果或人物立场。

---

## 9. 数据库、安全与生产红线

本交接单不授权数据库或生产变更。

必须遵守：

> 本仓与归档仓共用 Supabase 项目 `xfwkjhajrqxsakzovcwx`；RLS 是唯一安全边界。

> 权威 RLS 状态是 `harden_rls.sql`。新增表/策略时同步其独立 setup 脚本与 `harden_rls.sql`。

> 寄语簿首次上线前执行 `setup_testimonials.sql`；未执行时前端必须只读降级。

> `comments.album_id = 0` 是 ops queue；`__mathclass_ops__::` 审核回执属于“文本当协议”，不得放松 moderation 双守卫。

> `comments.user_email` 对 anon 遮蔽；查询必须显式列名，禁止 `select('*')`。

> 角色提升只允许 `super_admin`，继续通过 `public.is_super_admin()` 的 security-definer 边界。

> Gemini / ElevenLabs key 只放 Cloudflare Worker secret，绝不进入前端环境变量或产物。

若未来任务触碰 Supabase：

1. 先完整阅读 `harden_rls.sql`；
2. 不使用 service-role 前端写法；
3. 不放松 policy；
4. 不以“本地能用”为由绕过 RLS；
5. 不执行远端 SQL，除非用户原文点名授权。

部署红线：

> 只运行本仓 `./deploy.sh`。绝不运行 `MathClassWebsite/deploy.sh`。

未得到用户原文点名“部署/上线”时，不得运行部署。

---

## 10. Fail-loud 条款

遇到以下任一情况，必须明确报错/阻塞，不得用视觉掩盖：

1. `selected-option-2.png` 缺失或打不开：
   - 停止视觉重构；
   - 不得仅凭文字重新生成“相近风格”。
2. 三界 `data-seed` 不一致：
   - 判定对象连续性失败；
   - 不得只把数字隐藏。
3. Limite 已产生 scar，但返回 PLAN/Carnet 后 `data-scar != present`：
   - 判定持久化失败。
4. 同一 viewport 同时挂载 desktop/mobile 两套 DOM：
   - 判定双端架构回归。
5. 过场出现双曲线/双 origin mark：
   - 判定 P2，不得以“动效很短”忽略。
6. Canvas 抛出异常、出现负 radius、NaN、Infinity：
   - 立即修复并加边界测试；
   - 不静默 clamp 掩盖数学状态错误。几何渲染半径可在绘制边界钳制，但领域数据不得静默篡改。
7. Supabase 不可用：
   - 保持只读降级；
   - 不造假留言、用户或共同体数据。
8. build 改写 `public/health.json`：
   - 验证后 `git restore public/health.json`；
   - 不把时间戳混入功能提交。
9. 设计 QA 缺少“参考图 + 浏览器实现”的同画面对照：
   - `final result: blocked`；
   - 不得宣称视觉通过。

---

## 11. 已验证的质量基线

最后一次完整验证（2026-07-19）：

```text
npm run lint   passed
npm test       14 files / 136 tests passed
npm run build  passed
git diff --check passed
```

`opsQueue` malformed JSON 测试会按设计打印 stderr，但测试通过；不要误判为产品运行时错误。

浏览器验证：

- Desktop：1440×1024；
- Mobile：390×844；
- PLAN → Carnet → Limite → PLAN；
- 三界 seed 一致；
- scar 持久；
- passage 完成后 overlay 数量归零；
- 控制台无 warning/error；
- 移动只挂 `.site-layout-mobile`；
- 桌面只挂 `.site-layout-desktop`。

设计 QA 正本：

```text
design-qa.md
```

最新章节结论：

```text
final result: passed
```

---

## 12. 当前仍只是模拟的部分

必须诚实说明：

- relief 是真实 raster image，不是实时几何浮雕；
- 曲线与局部响应是 Canvas 2D；
- 没有 normal map；
- 没有 mask pipeline；
- 没有 shader；
- 没有全站 WebGL；
- pointer 光影不是物理正确照明；
- Rössler flow 不是三体问题精确模拟。

第一阶段有意只用 CSS + Canvas 验证触摸感。不得为了“技术升级”擅自引入 WebGL/Three.js。

---

## 13. 已知 P3，不是当前阻塞

1. Limite relief 比参考更接近天体曲面，而不是明确的机翼试件。
2. `Carnet de classe` 是否继续作为公开名称尚未决定。
3. Poincaré 是否正式 canon 尚未决定。
4. 尚未写第二章。
5. 尚未引入思想化身的受约束语言。
6. 深层工具路由仍存在，但已退到世界之后。

没有用户新指令时，不要把 P3 自行升级为大重构。

---

## 14. 勿做清单

- 不要把作者作品重新写成“人大中法数学班官方站”。
- 不要说“我们班都……”除非存在真实共同事实与授权。
- 不要新增 AI 助手大厅。
- 不要恢复留言墙中心地位。
- 不要用背词、资源、管理功能填满三世界首页。
- 不要给哲学家/数学家做人物卡、生平页或通用聊天机器人。
- 不要伪造人物名言。
- 不要新增第二个数学对象来逃避第一章深度。
- 不要把 Raccord 01 删除；它是实验档案，但不再统治三界。
- 不要复制 ContraLabs / Wild Week / Apple / Claude 的视觉表面。
- 不要重新生成已经选定的 Poincaré 三件 relief，除非用户明确要求。
- 不要把移动端做成桌面端缩小版。
- 不要擅自 commit、push、开 PR、merge 或 deploy。
- 不要修改归档仓 `MathClassWebsite`。

---

## 15. 下一阶段推荐顺序

这只是推荐，不是自动授权。

### 阶段 A：Claude 接管确认

目标：证明 Claude 读懂了作品，而不是马上展示执行力。

验收：

- 能区分作者作品与班级官网；
- 能指出 Poincaré 的真实数学边界；
- 能说清三界共享的不是配色而是 artifact 命运；
- 能说清哪些决定仍待用户拍板；
- 未改代码。

### 阶段 B：用户亲自体验后收反馈

重点只问：

1. 不读说明，是否能发现三幕是同一对象？
2. passage 是否太明显、太弱或刚好？
3. scar 是否像真实后果，而不是装饰线？
4. 是否仍像“漂亮网页”，还是已经开始像“世界”？

不要用问卷式长列表逼用户做产品经理。让用户以直觉描述。

### 阶段 C：决定是否 canon

只有用户明确说 Poincaré 第一章成立，才：

- 修订 `docs/design/product-constitution.md`；
- 合并/更新 `docs/design/author-work-transition-resolution.md`；
- 更新 `AGENTS.md` 当前状态；
- 明确第一章 canon 与作品署名。

### 阶段 D：再决定第二章

第二章必须先提出三个**视觉/机制上真正不同**的方向，再由用户选择；不能复制第一章三幕模板。

---

## 16. 分支、commit 与 PR 建议

当前不授权执行。

若用户随后点名要求整理提交，先再次审计，再按耦合切：

1. **治理与作者身份**
   - `AGENTS.md`
   - `CONTEXT.md`
   - `docs/design/product-constitution.md`
   - `docs/design/author-work-transition-resolution.md`
   - 本 HANDOFF
2. **Enter 与双端体验骨架**
   - `src/pages/Enter*`
   - `src/experiences/desktop/Enter*`
   - `src/experiences/mobile/Enter*`
   - material primitives
3. **Poincaré 第一章**
   - Poincaré math/state/fields/passage
   - desktop/mobile world homes
   - raster assets
   - QA reference/comparison
4. **深层工具与内容页**
   - Resources / Recueil / Testimonials / Vocabulary / Assistant
   - 各自测试

但当前修改彼此有装配依赖，不能机械按文件拆 commit。每个 commit 必须独立通过：

```bash
npm run lint && npm test && npm run build
```

提交后仍需恢复：

```bash
git restore public/health.json
```

push、PR、merge、部署均需用户点名授权。

---

## 17. Claude 可直接发送给用户的接管确认模板

> 我已经完整阅读作者作品宪法、转向决议、审美档案、Poincaré 视觉真相源和当前代码现场。  
>   
> 我理解：这不是班级官网，而是诞生于数学班的作者数字作品；Poincaré 当前是通过设计与工程 QA 的候选第一章，但尚未被正式 canon。三个世界共享的是同一 artifact 的命运，不是三套配色。  
>   
> 当前工作树位于 `wip/worlds-recueil-testimonials-2026-07`，HEAD `d683054`，存在大量未提交/未跟踪的有效工作。我不会切 main、pull、清理、重建历史，也不会擅自 commit、push 或部署。  
>   
> 我会先复现桌面与移动的 PLAN → Carnet → Limite → PLAN，再按你的下一条指令继续创作。

---

## 18. 交接单自检

- [x] 零上下文执行方可以定位仓库、分支、真相源与预览入口。
- [x] 明确了执行顺序与理由。
- [x] 明确了脏工作树撞车风险。
- [x] 红线来自项目权威文档。
- [x] 明确本单不授权不可逆资源。
- [x] 产品口径、数学边界、视觉边界逐条写死。
- [x] 有 fail-loud 条款。
- [x] 有桌面/移动、状态、测试、构建与视觉验收标准。
- [x] 写明未完成项与勿做清单。
- [x] 写明分支/commit/PR 建议及用户拍板点。

