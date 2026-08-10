# HANDOFF｜《L’horizon immobile》选中方向 → Claude

> 日期：2026-07-24  
> 仓库：`/Users/jinshuopeng/Desktop/💻 Workspace/代码_三主线/math_网站/MathClassWebsite-public`  
> 执行方：Claude  
> 任务性质：第二章选中方向的阶段 D 桌面交互原型  
> 当前授权：允许本地分支、产品代码、测试、设计 QA；不授权 commit、push、PR、merge、部署或 canon 更新  
> 入库归属：本文件、原选中图与第二章原型属于同一后续任务；作者未认可原型前不得写入正式 canon

---

## 0. 已经拍板的结论

作者在 Codex 生成的三张新方向图中明确选择：

```text
原始第 1 张
```

视觉真相源：

```text
docs/screenshots/foucault-selected-direction-codex-1.png
```

该文件由原始生成图中心裁切为严格 `1440 × 1024`，没有改变构图内容。

不要误选：

- 不是 Codex 随后生成的“删线净化版”；
- 不是 Claude 先前的 `direction-1-la-rotonde-rev.png`；
- 不是 Claude 的黑球 `direction-2-les-deux-verticales-rev.png`；
- 不是长廊方向；
- 不是暗色近景重球方向。

本次选择解除原交接单“作者选择前禁止实现”的闸门。现在进入阶段 D，但只先做**桌面交互原型**；移动端尚无作者选定的独立构图，桌面亲测前不把桌面缩成手机。

---

## 1. 执行顺序

严格按序推进，原因是第二章的物理、状态、视觉与正式入口仍有不同权限边界。

### D0｜只读接管与确认

先完整阅读：

1. `AGENTS.md`
2. `CONTEXT.md`
3. `docs/design/product-constitution.md`
4. `docs/design/author-work-transition-resolution.md`
5. `HANDOFF_2026_07_23_HORIZON_IMMOBILE_TO_CLAUDE.md`
6. 本文件
7. `docs/design/foucault/source-notes.md`
8. `/Users/jinshuopeng/Desktop/审美偏好.md`

并实际打开查看：

1. `docs/screenshots/foucault-selected-direction-codex-1.png`
2. `docs/design/poincare/selected-option-2.png`
3. `docs/design/poincare/qa/comparison-continuity-final.jpg`

确认现场：

```bash
pwd
git branch --show-current
git rev-parse --short HEAD
git status --short
git diff --check
```

先向作者确认：

- 当前 Git 状态；
- 已识别正确的“原始第 1 张”；
- 对“线很多但仍选原图”的理解；
- 本轮允许本地实现，但不 commit / push / PR / merge / deploy。

### D1｜领域与状态

先做纯逻辑、单测和可注入 clock，再碰画面。理由：时间映射或持久化若不可信，视觉越美越会掩盖错误。

### D2｜桌面交互原型

原型使用独立直达路由：

```text
/horizon
```

它应当像 `/enter` 一样占据完整视口，不套现有世界首页模板。当前不改 Home、Enter 或正式章节入口。

### D3｜桌面视觉 QA

必须以 `1440 × 1024` 对选中原图进行同画幅比较，修复 P0/P1/P2。完成后停在本地预览，交作者亲自体验。

### D4｜作者体验后再决定

作者明确认可桌面机制后，才：

- 设计 `390 × 844` 的独立移动构图；
- 决定正式入口；
- 决定是否进入 canon；
- 决定 commit / push / PR / merge / deploy。

---

## 2. 当前现场与撞车警告

交接时预期：

```text
branch: main
HEAD: c3de1c0
tracked product code: 未改
untracked:
  HANDOFF_2026_07_23_HORIZON_IMMOBILE_TO_CLAUDE.md
  docs/design/foucault/
  HANDOFF_2026_07_24_HORIZON_SELECTED_CODEX_1_TO_CLAUDE.md
```

这些未跟踪文件是阶段 B/C 与本次选择记录，不是垃圾，不得删除或覆盖。

同一工作树同一时刻只允许一个写者。本文件投递后，Claude 是唯一写者；Codex 停止修改。

建议本地分支：

```text
wip/horizon-immobile
```

不得先 pull、reset、stash、clean 或切走现有未跟踪文件。若现场与上述不符，先报告差异。

---

## 3. 选中图的视觉口径

实现须与以下逐条一致。

### 3.1 不是海报，而是一间房

画面是一座可进入的浅色石质仪式空间：

- 暖灰石墙与石地连续衔接；
- 左右柱体建立人类尺度；
- 一枚有磨损与重量的铜摆悬在中轴；
- 定向自然光从右上侧掠过石面；
- 足够安静，但不是黑色空背景；
- 页面主体统治整个视口，不装入卡片。

不得退回：

- 黑底行星；
- 摄影棚产品图；
- 科学馆展板；
- 香水广告；
- 雷达或仪表盘。

### 3.2 多条线为何保留

作者指出原图“杂线多”，看过删线版后仍明确选择原图。因此处理规则不是“全部删掉”，而是建立层级：

1. **摆的竖直**：正中钢索，最清楚，属于惯性关系。
2. **房间的竖直**：偏离中轴的建筑接缝或光刻线，次清楚，属于地面参照系。
3. **建筑材料线**：石板缝、墙面曲率、地面弧形嵌线，只作低对比背景证据。
4. **释放刻痕**：球下极小的低饱和铜绿点，证明初始方向。

不得让四层线使用相同亮度、线宽或动态权重。  
不得把所有偶然生成像素逐线复刻成活动对象。  
不得用“更干净”为理由删除原图的空间结构、地面嵌线与房间证据。

### 3.3 字体

原图文字属于建筑，不是悬浮海报字。

建议只用项目已有两种字体：

```text
标题：EB Garamond Roman 500
微字：JetBrains Mono 400
```

`1440 × 1024` 基线：

```text
L’HORIZON IMMOBILE
font-size: 30–34px
font-style: normal
letter-spacing: 0.14–0.18em
weight: 500

LES DEUX VERTICALES
font-size: 11–13px
letter-spacing: 0.28–0.34em
weight: 400
```

标题最多出现一次，严格居中；不斜体、不弧排、不使用 Didot 香水广告语法。没有解释段落。

### 3.4 色彩与材料

从选中图取样并在 QA 中微调：

```text
石材基底：暖骨灰 / 浅石灰
结构暗部：暖石墨
中心重物：旧铜 / 深褐金属
唯一活性点：低饱和铜绿
```

不使用第一章钴蓝或 Limite 朱红作为主色。没有大面积 glow、玻璃、紫色渐变或粒子。

### 3.5 构图

- 严格中轴；
- 摆球略低于画面中心；
- 标题位于中上部，不压在球上；
- 光、柱体、墙面与地面都服务于中心重物；
- 石厅必须延伸到四边，不能成为居中卡片或舞台截图；
- 留白是石材与空气，不是空 DOM。

---

## 4. 第二章的法则

### 4.1 思想化身

Léon Foucault 不通过肖像、生平、名言或聊天框出现。他只通过一个关系复活：

> 摆保持自己的关系；观察者脚下的房间改变了相对于摆动平面的方向。

### 4.2 唯一动作

```text
选择一个初始方向，然后放手。
```

桌面：

```text
pointer drag → release
```

只允许一次正式释放。释放后：

- pointer 不再调参；
- 不允许连续拖着玩；
- 不出现 reset、score、success、level；
- 世界按时间继续。

### 4.3 四态

```text
dormant
gesture
released
revealed
```

- `dormant`：重球静悬，房间与摆的竖直近乎一致。
- `gesture`：访客只选择摆动平面；不改重力、纬度、速度或振幅参数。
- `released`：摆动平面保持；房间层开始不可察觉地改变。
- `revealed`：摆的竖直与房间竖直、释放刻痕、地面嵌线之间出现可感角差。

视觉反转必须来自整间房的证据累积，不得弹出“地球在转”的答案。

### 4.4 时间

真实领域层：

```text
ωp = ΩEarth · sin(φ)
```

巴黎：

```text
φ = 48.8566°N
ωp ≈ 11.327°/h
完整一周 ≈ 31.78h
```

网页视觉可使用明确分层的艺术性 `timeScale`，但：

- 真实物理值保留在纯逻辑层；
- `timeScale` 单独命名；
- 页面不显示加速后的伪真实秒表或度数；
- 技术文档写明 `ideal maintained Foucault pendulum` 与艺术性时间压缩；
- 再次进入按时间戳恢复，不靠后台 RAF 假装持续运行。

### 4.5 后果

第二章留下的是：

```text
改变后的参照方向
```

不是第一章 scar，不读取或污染：

```text
poincare_sky_v1
carnet_world
```

独立命名空间：

```text
localStorage.foucault_horizon_v1
```

解析失败时 fail-safe 回到 `dormant`，不得静默拼出半坏状态。

---

## 5. 实现边界

建议分层：

```text
src/components/material/foucaultMath.js
src/components/material/foucaultMath.test.js
src/components/material/foucaultState.js
src/components/material/foucaultState.test.js
src/components/material/useFoucaultHorizon.js
src/components/material/FoucaultPendulumField.jsx
src/components/material/FoucaultPendulumField.css
src/experiences/desktop/FoucaultHorizonDesktop.jsx
src/experiences/desktop/FoucaultHorizonDesktop.css
src/pages/Horizon.jsx
```

最终命名可按现有模块规范调整，但边界不可合并为一个大组件：

```text
pure math
→ pure state transition
→ hook / injected clock
→ Canvas/material field
→ desktop composition
→ route assembly
```

首轮技术：

```text
CSS + Canvas 2D + raster material assets
```

不引入 Three.js、全站 WebGL、物理引擎、音频、设备传感器或新状态库。

`foucault-selected-direction-codex-1.png` 是视觉真相源，不是允许整张铺成静态网页的生产实现。中心关系必须真实可动；不得把截图当全屏背景后伪装成交互作品。

Canvas：

- DPR 有上限；
- 不可见或页面 hidden 时停止 RAF；
- resize 后状态不丢；
- unmount 清理监听；
- 不出现 NaN / Infinity / 负半径；
- 绘制层只消费归一化状态。

`prefers-reduced-motion` 必须保留“摆与房间不再对齐”的静态分阶段证据，不能关闭动画后只剩静物。

---

## 6. 测试与 fail-loud

纯数学最低手算对拍：

1. `φ = 0°` → `0°/h`
2. `φ = 90°` → `ΩEarth`
3. 南半球同纬度 → 符号相反
4. 巴黎 → `≈ 11.327°/h`
5. `elapsed = 0` → 当前方向等于释放方向
6. 多周后角度稳定归一化

状态最低测试：

1. dormant → gesture → released 只发生一次
2. released 后 pointer 更新不再改变初始方向
3. clock 可注入，不依赖真实等待
4. corrupt / future-version storage → fail-safe dormant
5. 无 `releasedAt` 时不得伪造 revealed
6. 离开再回来按 timestamp 得到同一确定结果
7. 不读取或写入 Poincaré 状态

输入出现非有限数、越界纬度、非法时间戳或未知 schema 时必须明确拒绝或 fail-safe，不静默 `clamp` 成一个看似正常的作品状态。

---

## 7. 验收

桌面阶段最低门禁：

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev --audit-level=high
git diff --check
git restore public/health.json
```

浏览器：

- `/horizon` 在 `1440 × 1024` 正确；
- dormant / gesture / released / revealed 均实测；
- 只能释放一次；
- released 后世界自主继续；
- hidden 与离开 viewport 后 RAF 停止；
- 返回后按时间戳恢复；
- storage 损坏安全回 dormant；
- reduced-motion 核心关系成立；
- console 无 warning/error；
- `/enter` 与第一章完整回归。

视觉 QA：

```text
source:
docs/screenshots/foucault-selected-direction-codex-1.png

implementation:
docs/design/foucault/qa/desktop-*.png
```

必须同画幅并排比较，`design-qa.md` 最终只能写：

```text
final result: passed
```

若还存在 P0/P1/P2，则只能是 `blocked`，不得用“代码已完成”代替视觉通过。

桌面通过后停下，交作者体验。此时不要自动开发移动端或正式入口。

---

## 8. 项目红线

以下来自项目权威口径，本单不得覆盖：

> 本仓是 math 主线唯一活跃代码仓与 `rucmathclass.com` 的构建来源。改代码、提交、部署只在这里进行；兄弟仓 `MathClassWebsite` 已归档，只作为私有班级照片源。

> 本站当前称“作者作品”，数学班是“出生坐标”；禁止再把它默认描述为代表班级集体意志的“班级官网”。

> 桌面端与移动端是两条独立体验线，只挂载当前 viewport 对应的 DOM；共享层只放 domain data、world state、SRS/API 与 `components/material` primitives。禁止同时渲染双端后用 CSS 隐藏，也禁止把桌面侧栏/双栏仅靠 media query 压成手机。

> 站名 `Raccord`；章节名保留法语。站面不出现作者姓名与班级信息；无页脚署名，meta/og 不含个人或班级字段。

> 本仓与归档仓共用 Supabase 项目 `xfwkjhajrqxsakzovcwx`；RLS 是唯一安全边界。

> Gemini / ElevenLabs key 只放 Cloudflare Worker secret，绝不进入前端环境变量或产物。

> 只运行本仓 `./deploy.sh`。绝不运行 `MathClassWebsite/deploy.sh`。

本章不需要数据库，不新增 Supabase 表，不执行远端 SQL。

本单不授权：

- commit；
- push；
- PR；
- merge；
- production deploy；
- canon 更新；
- Home / Enter 正式入口决定。

---

## 9. 勿做

- 不重新探索第四方向。
- 不混合其余两张方向图。
- 不使用删线净化版替代选中图。
- 不把所有生成图杂线变成同等权重的动态线。
- 不把页面做成科学课件或傅科人物专题。
- 不做 AI 傅科、聊天框、肖像、生平或伪名言。
- 不加入地球、星空、陀螺、飞机、地图、公式面板或仪表群。
- 不做参数模拟器、小游戏、reset、score、level、achievement。
- 不复制第一章三幕、seed、memory 或 scar。
- 不修改第一章中心体验。
- 不修改归档仓 `MathClassWebsite`。
- 不清理现有未跟踪设计文件。
- 不 `git add -f` 被 ignore 的图片。
- 不提交、推送、开 PR、合并或部署。

---

## 10. 接管确认模板

执行方读完后先发：

> 我已完整阅读第二章原章法与 2026-07-24 选中方向交接单。  
> 我确认作者选择的是 `docs/screenshots/foucault-selected-direction-codex-1.png` 对应的原始第 1 张，不是删线版，也不是先前的黑球/长廊方向。  
> 我理解多条线应通过层级而非删除处理：摆的竖直最清楚，房间竖直次之，建筑材料线退后；作品核心仍是一次释放后观察者失去静止特权。  
> 我将先核对现场与纯领域模型，再在独立 `/horizon` 路由做桌面原型；不改 Home/Enter，不做移动端，不 commit、push、PR、merge 或部署。

确认后可连续推进 D1–D3，不必再次等待方向选择。

---

## 11. 自检

- [x] 选中图路径、尺寸与排除项明确。
- [x] “原图杂线”与“仍选原图”的口径没有被擅自改写。
- [x] 章节灵魂、唯一动作、世界回应、时间和后果逐条写死。
- [x] 物理真实层与艺术时间层分离。
- [x] 纯数学、状态、Canvas、桌面装配边界明确。
- [x] 手算对拍、状态测试、fail-loud 和 reduced-motion 齐全。
- [x] 桌面先行、移动后置、入口未定的停止条件明确。
- [x] 项目红线、勿做清单、Git 与部署权限明确。
