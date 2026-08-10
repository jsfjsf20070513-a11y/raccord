# HANDOFF｜Raccord 第二章《L’horizon immobile》→ Claude

> 日期：2026-07-23  
> 目标仓库：`/Users/jinshuopeng/Desktop/💻 Workspace/代码_三主线/math_网站/MathClassWebsite-public`  
> 作品：Raccord  
> 任务性质：第二章概念、视觉探索与后续实现交接  
> 当前授权：先完成研究与三种视觉/机制方向；作者选择前禁止进入正式实现  
> 不可逆资源：本单不授权 commit、push、PR、merge、数据库写入或生产部署  
> 入库归属：若第二章最终成立，本文件随第二章设计/实现任务入库；未成立则作为实验档案保留

---

## 0. 一句话命题

第二章不是“傅科摆模拟器”，而是一间让观察者失去静止特权的房间：

> 你以为自己站在世界之外观察；世界却证明你也在运动之中。

暂定章名：

```text
L’horizon immobile
不动的地平线
```

`L’horizon immobile` 是当代作品语言，不是 Léon Foucault 的历史原话。

---

## 1. 执行顺序

严格按以下阶段推进。顺序不可调换，因为第二章的灵魂已经成立，但视觉空间、入口位置和最终技术仍未选择；先写代码会让现成组件替作品做决定。

### 阶段 A｜只读接管

1. 确认现场：

   ```bash
   pwd
   git branch --show-current
   git rev-parse --short HEAD
   git status --short
   git diff --check
   ```

2. 完整阅读：
   - `AGENTS.md`
   - `CONTEXT.md`
   - `docs/design/product-constitution.md`
   - `docs/design/author-work-transition-resolution.md`
   - `HANDOFF_2026_07_23_RACCORD_TO_CHATGPT.md`
   - `HANDOFF_2026_07_23_作者数字作品_TO_CLAUDE.md`
   - 本文件
   - `/Users/jinshuopeng/Desktop/审美偏好.md`
3. 复现现有作品：
   - Enter；
   - 第一章桌面 1440×1024；
   - 第一章移动 390×844；
   - PLAN → Carnet → Limite → PLAN；
   - 查看 `docs/design/poincare/selected-option-2.png`；
   - 查看 `docs/design/poincare/qa/comparison-continuity-final.jpg`；
   - 阅读 `design-qa.md` 的 Poincaré 章节。
4. 第一轮只向作者确认：
   - 当前 Git 状态；
   - 对本章一句话命题的理解；
   - 明确本阶段不会写代码、修宪或部署。

### 阶段 B｜史料与物理边界

只做支撑章节所需的最小研究，不写人物生平。

必须核验：

1. 1851 年傅科摆公开演示的历史事实；
2. 摆动平面、地球自转与观察者参照系之间的关系；
3. 进动速率与纬度的关系；
4. 巴黎纬度下约 11°/小时这一数量级；
5. 物理摆的阻尼与“持续运行”之间的诚实边界；
6. 傅科陀螺与摆的历史关系；
7. 航空地平仪、惯性参照系与本章之间若被使用，属于当代工程关联，不得冒充傅科本人提出的航空设计。

优先从以下官方来源开始：

- Musée des Arts et Métiers｜Démonstration du pendule de Foucault  
  `https://www.arts-et-metiers.net/musee/demonstration-du-pendule-de-foucault`
- Musée des Arts et Métiers｜Le fonctionnement du pendule  
  `https://www.arts-et-metiers.net/sites/arts-et-metiers/files/2021-10/field_media_document-423-cp_pendule_foucault.pdf`
- Musée des Arts et Métiers｜Gyroscope de Foucault  
  `https://www.arts-et-metiers.net/musee/gyroscope-de-foucault`

若使用历史原话，必须找到可核验原文、出处与页码。找不到则不用。作品不需要傅科说话才能成立。

研究结果存为：

```text
docs/design/foucault/source-notes.md
```

只记录与本章机制直接相关的事实、来源、可用边界和禁止误述。不要写人物专题。

### 阶段 C｜三个视觉/机制方向

在不改产品代码的前提下，提出**恰好三个**真正不同的方向，交由作者选择。

三个方向必须共享第 3 节的章法，但在以下至少三项上显著不同：

- 空间构图；
- 观察者位置；
- 摆锤与页面的尺度关系；
- “世界在动”的揭示方式；
- 光与材料；
- 时间显影方式；
- 移动端如何重新构图。

不得只是三种配色、三种字体或同一房间的三个镜头。

每个方向必须交付：

1. 一张 1440×1024 桌面主视觉；
2. 一段不超过 80 字的机制说明；
3. 一张 390×844 移动构图草图或清晰的移动构图说明；
4. 唯一动作的 4 个状态：
   - dormant；
   - gesture；
   - released；
   - revealed；
5. 明确指出它最可能失败成什么。

保存位置：

```text
docs/design/foucault/directions/
```

作者选择之前：

- 不创建正式页面；
- 不改路由；
- 不改 Home/Enter；
- 不改第一章；
- 不生成最终 raster relief；
- 不决定第二章入口；
- 不把候选方向混合为“折中稿”。

### 阶段 D｜选中后才做交互原型

只有作者明确选择某一方向后，才进入：

1. 选中方向的桌面/移动视觉深化；
2. 纯数学/时间模型；
3. 独立状态模型；
4. CSS + Canvas 原型；
5. 浏览器实机验证；
6. 设计 QA；
7. 作者亲自体验。

阶段 D 不自动授权 commit、push、PR、merge 或部署。

---

## 2. 当前现场与撞车警告

交接单起草时：

```text
branch: main
HEAD: c3de1c0
status: clean（写入本文件后，本文件为新增未跟踪文件）
```

`c3de1c0` 是 Claude → ChatGPT 的回传交接单提交；第一章已通过 PR #30 合入 main。

### 单写者

从本交接开始，Claude 是当前工作树的唯一写者。Codex 不与其并行修改。若作者另行指定其他写者，先停止并交接，不在同一工作树并写。

### 禁止撞车

在作者选择第二章方向之前，不得：

- 重构 Poincaré 第一章；
- 为第二章提前改 `Home.jsx`；
- 把第二章塞进现有 Poincaré state；
- 复用 `poincare_sky_v1`；
- 改写 Enter 三件器物；
- 以“章节系统”为名重做全站路由；
- 清理远端 WIP 分支；
- 顺手修复 Vocabulary chunk；
- 顺手部署旧版或新版。

如接管时 Git 状态不再符合本文件，先报告差异，不静默覆盖。

---

## 3. 第二章不可丢失的灵魂

以下口径实现须逐条一致。视觉可以自由，章法不可换。

### 3.1 思想化身

本章思想化身是 Léon Foucault。

他不以肖像、人物卡、生平、聊天框或仿古台词出现。他通过一个物理关系复活：

> 摆看似改变方向，实际上是观察者脚下的世界改变了相对于摆动平面的方向。

遮住人物姓名后，这一相遇仍须成立。

### 3.2 核心矛盾

```text
我以为自己静止
vs.
我与地面一起运动
```

本章不是讲“地球会自转”这一知识点，而是让访问者亲自失去“静止观察者”的位置。

### 3.3 中心对象

只有一件中心对象：

```text
一枚悬垂的重球及其摆动平面
```

不得同时加入：

- 陀螺仪；
- 飞机；
- 星空；
- 地球模型；
- 巴黎地图；
- 物理公式面板；
- 仪表群。

这些可以成为极弱的材料暗线，但不能成为第二中心。

### 3.4 唯一动作

```text
选择一个初始方向，然后放手。
```

桌面可用 pointer drag → release；移动可用 touch drag → release。

动作完成后：

- 访客失去主控制权；
- pointer 不再调参；
- 不允许反复拖拽“玩效果”；
- 不出现 reset、score、level、success；
- 若需要重新开始，只能在完整体验结束后以极弱方式出现。

本章的动词不是“调节”，而是“释放”。

### 3.5 世界回应

摆锤释放后：

1. 摆动平面保持自己的关系；
2. 地面刻线、页面坐标、排版或空间边界缓慢改变；
3. 最初不能一眼看穿；
4. 随时间推移，证据逐渐累积；
5. 最终访问者意识到：被揭露的不是摆，而是自己所在的参照系。

界面不能弹出“地球在转”的解释完成这一任务。

### 3.6 时间法则

第一章由访问者持续操作推动；第二章必须相反：

- 放手之后，世界不再等待 pointer；
- 自主运动本身是内容，因此允许有限、可停止的 RAF；
- 页面不可见或组件离开 viewport 时停止绘制；
- 状态按时间戳推进，不靠后台 RAF 假装持续运行；
- 再次进入时，世界可以显示“在你离开期间已经改变”；
- 对 `prefers-reduced-motion` 提供非连续旋转的等价证据。

“世界继续”是作品法则。若模型采用加速时间，必须在技术文档中明确，不得冒充真实 1:1 傅科进动。

### 3.7 留下的后果

第一章留下 scar；第二章不得再复制 scar。

第二章留下：

```text
改变后的参照方向
```

它可以表现为：

- 地面刻度与最初方向之间的角差；
- 累积但克制的摆动平面记录；
- 再次进入时不再对齐的空间；
- 一条证明“房间曾经转过”的时间证据。

这不是奖励，也不是收藏品。

### 3.8 数字媒介的必要性

本章只有在数字媒介中成立的理由：

> 浏览器页面本身既是展示对象，也是观察者的坐标框架；作品可以让这个框架背叛访问者。

静态海报只能描绘摆。数字作品可以改变访问者用来判断“谁在动”的整个参照系。

### 3.9 与第一章的关系

第一章：

```text
你的微小选择改变未来。
```

第二章：

```text
你也在被世界携带。
```

这是一条思想递进，不是共享同一个 artifact。

第二章：

- 不读取 Poincaré seed；
- 不继承 Poincaré scar；
- 不强迫 PLAN → Carnet → Limite 三幕；
- 可以只占据一个空间；
- 可以从 Limite 的倾向生长，但入口归属须等视觉方向选定。

---

## 4. 视觉方向

### 4.1 总体气质

目标不是科学馆、课堂或航空仪表盘，而是：

```text
一座缓慢证明观察者并不静止的仪式空间
```

画面应具有：

- 宏大尺度；
- 单一重心；
- 连续曲率；
- 低噪声光影；
- 材料重量；
- 足够的黑或留白；
- 时间带来的庄严感；
- 不依靠长文解释的可感知关系。

### 4.2 可以继承

- Claude 稿的色调、字体克制、发丝线和异质响应；
- Apple 的低噪声光影；
- A350 / 787 的连续曲率与无硬切；
- 第一章 Poincaré 已建立的作品密度；
- Raccord 的匿名面貌；
- 法语章节名。

### 4.3 不必继承

- 第一章三界的相同构图；
- Poincaré 的轨迹语言；
- Limite 的朱红；
- 三界共享对象；
- 当前 Home 的装配结构；
- 第一章 raster relief 的纹理。

第二章可以拥有新材料，但必须仍像 Raccord，不像另一个网站。

### 4.4 字体与文字

- 标题最多出现一次；
- 页面不写人物生平；
- 页面不写公式说明；
- 页面不写操作教学；
- 页面不写“你正在观察……”；
- 不使用大段哲思文案弥补体验；
- 若最终保留一句作品语言，必须在没有它时体验也成立；
- 不得把作品语言冒充傅科原话。

### 4.5 明确拒绝

- 傅科肖像；
- 巴黎先贤祠旅游海报；
- 蒸汽朋克；
- 黄铜仪表墙；
- 星空粒子；
- 大面积 glow；
- 地球自转教学动画；
- 圆形 dashboard；
- 人工地平仪 UI 复刻；
- 陀螺仪参数面板；
- 普通 hover 放大；
- pointer 跟随光斑成为主角；
- 3D 球体在屏幕中央自转；
- 自动播放的宏大宣传片；
- 用音效制造廉价神秘感；
- 把移动端做成桌面端缩小版。

---

## 5. 防止变成玩具

本章失败的最短路径是：摆锤很好拖、轨迹很好看、访客一直玩，却没有发生观察者位置的反转。

因此必须满足：

1. 只有一次核心释放；
2. 释放后不能实时调频、调幅、调重力、调纬度；
3. 不显示可刷新的随机花纹；
4. 不用“成功发现地球自转”奖励访客；
5. 不把物理量做成可视化 dashboard；
6. 不靠指针持续输入制造视觉活性；
7. 不以“多功能”延长停留；
8. 视觉高潮来自参照系的背叛，不来自特效强度；
9. 即使访客不理解物理，也应感到“房间与我并不可靠”；
10. 即使访客理解物理，也不能只得到一张熟悉的傅科摆演示。

---

## 6. 物理与模拟诚实性

### 6.1 推荐领域模型

若进入实现，纯逻辑建议独立为：

```text
src/components/material/foucaultMath.js
src/components/material/foucaultMath.test.js
```

至少包含：

- 纬度归一化；
- 地球自转角速度；
- 傅科进动角速度；
- 给定起始方向与 elapsed time 的相对方向；
- 视觉时间映射；
- 角度归一化。

标准关系可表示为：

```text
ωp = ΩEarth · sin(φ)
```

但编码前必须用阶段 B 的可靠来源再次核验符号、单位和展示口径。

最低手算对拍：

1. 赤道 `φ = 0°` → 进动率为 0；
2. 北极 `φ = 90°` → 进动率等于地球自转角速度；
3. 南半球符号相反；
4. 巴黎约 `48.8566°N` → 约 `11.3°/hour`，完整一周约 `31.8h`；
5. elapsed = 0 → 相对角等于初始角；
6. 多周后角度稳定归一化，不出现 NaN/Infinity。

### 6.2 真实时间与视觉时间

真实进动在一次网页停留中非常微小。视觉原型可以压缩时间，但必须：

- 领域层保留真实物理量；
- 视觉层单独定义 `timeScale`；
- `timeScale` 不写成物理事实；
- 页面不显示伪造的真实度数或真实秒表；
- QA 文档明确“艺术性时间压缩”；
- 不以加速后的画面声称“巴黎实际如此快速转动”。

### 6.3 理想维持摆

若作品允许访客离开后状态继续，技术文档须将对象说明为：

```text
ideal maintained Foucault pendulum
```

因为现实中无驱动摆会阻尼衰减。作品可以使用理想维持模型，但不能假装忽略阻尼仍是完整物理复现。

### 6.4 航空关联

允许把地平线、惯性参照系与飞行作为当代作品暗线；不得声称：

- 傅科为 A350 设计了惯导；
- 傅科摆直接等于现代人工地平仪；
- 本章是航空仪表的历史复原。

航空必须通过空间感与参照系进入，不通过品牌标志或产品宣传语进入。

---

## 7. 状态与组件边界（选中方向后适用）

### 7.1 状态

建议独立命名空间：

```text
localStorage.foucault_horizon_v1
```

候选字段：

- `releaseDirection`;
- `releasedAt`;
- `chapterTimeScale`;
- `lastObservedAt`;
- `referenceOrientation`;
- schema version。

最终字段以选中方向为准，但必须：

- versioned；
- 可测试；
- 解析失败时 fail-safe 回到 dormant；
- 不污染 `carnet_world`；
- 不读取或改写 `poincare_sky_v1`；
- 时间计算允许注入 clock，测试不依赖真实等待。

### 7.2 分层

建议边界：

```text
pure math
→ pure state transition
→ hook / injected clock
→ shared material primitive
→ desktop composition
→ mobile composition
```

不得把物理公式、localStorage、Canvas 绘制与页面装配塞进一个组件。

### 7.3 双端

- 桌面与移动只挂当前 viewport 对应 DOM；
- 共享数学、状态和必要的 material primitive；
- 不共享首页结构；
- 移动端不依赖 DeviceOrientation 权限；
- 不把手机陀螺仪作为核心输入；
- 移动端仍是“选择方向并释放”，不是摇手机小游戏。

### 7.4 初期技术

首个交互原型优先：

```text
CSS + Canvas 2D
```

除非选中方向明确证明 WebGL 不可替代，并由作者另行拍板，否则：

- 不引入 Three.js；
- 不引入全站 WebGL；
- 不做粒子系统；
- 不做物理引擎；
- 不做音频系统；
- 不做设备传感器权限流。

---

## 8. 动效、可访问性与性能

### 8.1 动效

自主运动在本章有明确叙事理由，但仍须：

- 低频；
- 可停止；
- 页面 hidden 时不绘制；
- 离开 viewport 时不绘制；
- 不使用永续高频噪声；
- 不用摄像机大角度旋转制造眩晕；
- pointer 停止后不再由 pointer 制造新变化。

### 8.2 `prefers-reduced-motion`

减少动态模式不能只“关掉动画然后什么都不剩”。

它必须用以下一种或组合方式保留关系：

- 分阶段静态方向差；
- 逐次显影的地面证据；
- 离散而非连续的参照线变化；
- 初始与当前方向并置。

无需解释文字也应看出摆与地面不再对齐。

### 8.3 Canvas

- DPR 有上限；
- resize 后保持状态；
- 半径、线宽和 transform 不得为负；
- 不出现 NaN/Infinity；
- component unmount 后移除监听；
- 不可见时停止 RAF；
- 绘制层只消费归一化状态；
- 几何钳制只发生在绘制边界，不静默篡改领域数据。

---

## 9. 预注册判据

以下判据在原型判决时不得为了保住实现而改写。

### 9.1 三方向选择闸门

三个方向展示后，作者有四种合法结论：

1. 选择其中一个；
2. 指定两个方向的明确部分，要求生成一个新的合成方向；
3. 三个都不成立，要求重新探索；
4. 推翻本章。

“已经做了三张”不构成选择理由。未选择不得进入正式实现。

### 9.2 原型成立闸门

选中方向的原型只有同时满足以下条件，才有资格成为第二章：

1. 遮住 Foucault 姓名与标题，相遇仍成立；
2. 不读说明文字，访客能感到摆与房间的方向关系发生变化；
3. 至少一名不知情访客在体验后主动表达近似含义：
   - “地面/页面在转”；
   - “好像不是摆在改变”；
   - “我也在动”；
4. 访客只需完成一次释放，不需要发现隐藏参数；
5. 体验不会被描述为：
   - 物理课件；
   - 摆锤小游戏；
   - 仪表盘；
   - 纯动画壁纸；
6. 第二章与第一章在动作、时间、状态与画面结构上明显不同；
7. 桌面与移动表达同一思想，但不是同一 DOM/同一构图缩放；
8. reduced-motion 下核心关系仍成立；
9. 物理模拟边界在技术文档中诚实；
10. 结束后留下的问题接近：

    ```text
    我凭什么称自己静止？
    ```

若只记住“摆锤很好看”，本章不成立。

### 9.3 Canon 闸门

代码完成、测试通过、视觉 QA 通过，都不等于 canon。

只有作者亲自体验并明确认可后，才允许：

- 更新 `AGENTS.md` 当前产品状态；
- 更新转向决议附记；
- 把第二章称为正式章；
- 设计正式章节入口；
- 提交/推送/PR/合并（仍按作者逐项授权）。

---

## 10. 视觉 QA

每次声称视觉通过，必须有：

1. 选中方向原图；
2. 同 viewport 浏览器截图；
3. 两者同画面对照；
4. desktop 1440×1024；
5. mobile 390×844；
6. dormant / released / revealed 三态；
7. reduced-motion 状态；
8. 视觉偏差清单；
9. `final result: passed | blocked`。

只看浏览器截图不算视觉 QA。参考图与实现未并排时，结果必须是 `blocked`。

建议保存：

```text
docs/design/foucault/selected-direction.png
docs/design/foucault/qa/
```

---

## 11. 工程验证（进入实现后）

最低门禁：

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev --audit-level=high
git diff --check
```

注意：

```bash
git restore public/health.json
```

因为 predev/prebuild 会改写 buildTime。

浏览器必须验证：

- Desktop 1440×1024；
- Mobile 390×844；
- 当前 viewport 只挂一套 DOM；
- release 只发生一次；
- visibility change 后 RAF 停止；
- 返回后状态按时间戳恢复；
- storage 损坏时安全回 dormant；
- reduced-motion 可读；
- console 无 warning/error；
- 第一章 Poincaré 完整回归；
- Enter 完整回归；
- 世界切换完整回归。

---

## 12. 项目红线（来自 `AGENTS.md`）

以下规则照抄当前项目权威口径，本单不得覆盖。

> 本仓是 math 主线唯一活跃代码仓与 `rucmathclass.com` 的构建来源。改代码、提交、部署只在这里进行；兄弟仓 `MathClassWebsite` 已归档，只作为私有班级照片源。

> 本站当前称“作者作品”，数学班是“出生坐标”；禁止再把它默认描述为代表班级集体意志的“班级官网”。

> 桌面端与移动端是两条独立体验线，只挂载当前 viewport 对应的 DOM；共享层只放 domain data、world state、SRS/API 与 `components/material` primitives。禁止同时渲染双端后用 CSS 隐藏，也禁止把桌面侧栏/双栏仅靠 media query 压成手机。

> 站名 `Raccord`；章节名保留法语。站面不出现作者姓名与班级信息；无页脚署名，meta/og 不含个人或班级字段。

> 本仓与归档仓共用 Supabase 项目 `xfwkjhajrqxsakzovcwx`；RLS 是唯一安全边界。

> 权威 RLS 状态是 `harden_rls.sql`。新增表/策略时同步其独立 setup 脚本与 `harden_rls.sql`。

> `comments.album_id = 0` 是 ops queue；`__mathclass_ops__::` 审核回执属于“文本当协议”，不得放松 moderation 双守卫。

> `comments.user_email` 对 anon 遮蔽；查询必须显式列名，禁止 `select('*')`。

> 角色提升只允许 `super_admin`，继续通过 `public.is_super_admin()` 的 security-definer 边界。

> Gemini / ElevenLabs key 只放 Cloudflare Worker secret，绝不进入前端环境变量或产物。

> 只运行本仓 `./deploy.sh`。绝不运行 `MathClassWebsite/deploy.sh`。

本章不需要数据库。不得为了“记忆”新增 Supabase 表；本地 versioned artifact 足够，除非作者以后明确要求跨设备持久化。

本单不授权生产部署。

---

## 13. 勿做清单

- 不把第二章写成傅科人物专题。
- 不做 AI 傅科。
- 不做傅科聊天框。
- 不伪造傅科名言。
- 不复制第一章三幕模板。
- 不强迫三个世界共享第二章对象。
- 不把 Poincaré seed 变成摆锤初始条件。
- 不再制造 scar。
- 不做物理教学页面。
- 不做参数模拟器。
- 不做游戏化。
- 不加入 leaderboard、成就或收藏。
- 不以人工地平仪/A350 cockpit 作为视觉表面。
- 不用飞机品牌标志证明航空感。
- 不把 Pantheon 当旅游背景图。
- 不上粒子、glow、毛玻璃、通用圆角卡片。
- 不堆哲学文字。
- 不让 Claude 稿的既有配色替第二章自动作答。
- 不在方向选择前实现路由与状态。
- 不在实现过程中顺手重构第一章。
- 不修改归档仓 `MathClassWebsite`。
- 不执行远端 SQL。
- 不 commit、push、开 PR、merge 或 deploy，除非作者原文点名。
- 不 `git add -f`。

---

## 14. 推荐分支与提交边界

当前不授权执行，只规定未来边界。

作者选择方向并点名开工后，建议：

```text
wip/horizon-immobile
```

按耦合拆分：

1. `docs(foucault)`  
   - source notes；
   - 三方向；
   - 选中方向；
   - 章法与 QA 基线。
2. `feat(foucault-domain)`  
   - 纯数学；
   - 状态；
   - 单测；
   - 不含 UI。
3. `feat(foucault-experience)`  
   - material primitive；
   - desktop/mobile composition；
   - 路由/入口装配；
   - 回归测试。
4. `docs(foucault-qa)`  
   - 最终视觉对照；
   - 浏览器验证；
   - 原型闸门结果。
5. `docs(canon)`  
   - 仅在作者明确认可第二章后；
   - 更新治理正本。

每个代码提交独立通过 lint/test/build。push、PR、merge 和部署仍须作者点名。

---

## 15. 接管确认模板

执行方读完后先向作者发送：

> 我已经完整阅读 Raccord 的宪法、作者转向决议、第一章交接与《L’horizon immobile》章法。  
>   
> 我理解第二章的核心不是傅科摆本身，而是观察者失去静止特权：访客只选择方向并释放一次，随后摆保持关系，房间与页面坐标逐渐暴露自己的运动。它不共享 Poincaré artifact，不复制 scar，也不强迫穿过三个世界。  
>   
> 我会先核验最小史料与物理边界，再给出恰好三个视觉/机制真正不同的方向。作者选择前，我不会改产品代码、路由、第一章或宪法，也不会 commit、push、PR、merge 或部署。

---

## 16. 交接单自检

- [x] 零上下文执行方可以理解作品身份与第二章命题。
- [x] 执行顺序与每阶段停止条件明确。
- [x] 明确作者选择前禁止实现。
- [x] 明确单写者与撞车范围。
- [x] 人物、动作、世界回应、时间与后果逐条写死。
- [x] 明确第二章不复制第一章 artifact/scar/三幕。
- [x] 物理真实性与艺术性时间压缩分层。
- [x] 包含纯数学手算对拍与边界测试。
- [x] 包含 fail-loud、reduced-motion、Canvas 与双端约束。
- [x] 包含视觉 QA 与不知情访客闸门。
- [x] 项目 RLS、隐私、部署与匿名红线完整。
- [x] 勿做清单完整。
- [x] 分支、提交与 canon 权限边界明确。

