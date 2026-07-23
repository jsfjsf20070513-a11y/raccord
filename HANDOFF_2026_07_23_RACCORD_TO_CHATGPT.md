# HANDOFF｜Raccord → ChatGPT (Codex)

> 日期：2026-07-23（晚于 `HANDOFF_2026_07_23_作者数字作品_TO_CLAUDE.md`，本单是它的回传）
> 目标仓库：`/Users/jinshuopeng/Desktop/💻 Workspace/代码_三主线/math_网站/MathClassWebsite-public`
> 交出者：Claude / Claude Code
> 当前性质：状态回传 + 写者交还。生产**未部署**，本单不授权部署。

---

## 0. 一句话现状

你交出的两周创作现场已全部入库并合进 main：`main@7295135`（Merge PR #30），工作树干净，无未提交文件。第一章获作者轻量认可，站名定为 **Raccord**，站面匿名。生产 rucmathclass.com 仍是旧版 Carnet de classe，**尚未发布**。

## 1. 你交出之后发生了什么（时序）

1. Claude 按你交接单第 0 节执行只读验收：现场审计、权威文档、视觉真相源、桌面 1440×1024 与移动 390×844 各走通 PLAN → Carnet → Limite → PLAN。三界 `data-seed` 一致、单树挂载、控制台零错误。你交接单的声称与现场零出入。
2. 作者亲自体验后拍板：**第一章成立**。原话级记录见 `docs/design/author-work-transition-resolution.md` 附记——「隐晦是真的，但美也是真的，后面慢慢加」。**此认可是轻量拍板，作者明确要求不得将其立为金科玉律。**
3. 作者点名「善后」：全部工作按你 §16 的分块方案入库（8 个提交，见下）。
4. 作者选定站名 **Raccord**（法语：衔接/连戏——数学 raccordement 曲线拼接、电影连戏、对象穿界过场，三义同源）。
5. 作者随后点名撤回落款：**站面不出现作者姓名与班级信息**。meta/og 已清；既有工具层班级资料页（`siteContent.js`）除外，未动。
6. 作者点名 push + PR + 合并：PR #30 已合入 main，CI（lint-and-build）绿。

## 2. 提交清单（d683054 之后）

```text
47a2f7d docs(œuvre)     治理正本:宪法/转向决议/CONTEXT/你的交接单
9153412 feat(material)  双端骨架与材质原语(87 文件 +8545 行)
9042150 feat(poincare)  第一章接线:三界共享命运对象(-1477 行旧页面)
79379bc docs(qa)        design-qa 正本 + 视觉真相源 + 最终对照(按 .gitignore 白名单)
3d3a75a docs(canon)     作者认可第一章成立(轻量认可附记)
0fdf876 feat(identité)  站名 Raccord + 页脚落款(旋即被撤回)
d861b4c fix(identité)   撤回落款:站面无作者/班级信息
7295135 Merge PR #30
```

## 3. 已拍板决定台账（勿重开已决之事）

| 决定 | 状态 |
|---|---|
| 第一章《Le ciel de Poincaré》 | **成立**（轻量认可，非金科玉律） |
| 隐晦语法（Carnet 驻留显影 / Limite 长按加载，均无提示） | **保留**，不加暗示 |
| Limite relief 天体感造型 | **本期不重做**（P3 留档） |
| 站名 | **Raccord**；章节名保留法语 |
| 站面署名 | **无**。站面与 meta/og 不出现作者姓名与班级信息；署名回到未定 |
| 正式修宪 | **暂缓**；现行宪法 + 转向决议 + 附记继续有效 |
| 生产部署 | **未授权**。须作者原文点名 |

## 4. 质量基线（2026-07-23 最后验证）

```text
npm run lint     passed
npm test         14 files / 136 tests passed
npm run build    passed(仅既有 Vocabulary chunk 659kB warning)
git diff --check passed
CI lint-and-build passed(PR #30)
```

浏览器实机：双端全循环、seed 跨界一致、scar 持久链路有单测与 QA 证据。`build/predev 会改写 public/health.json`，验证后须 `git restore public/health.json`（本单交出时已干净）。

## 5. 接手者须知

- **单写者**：Claude 已停写。自本单起写者是你（或作者另行指定者）。
- 动手前先读：`AGENTS.md`（已含 Raccord 条款与第一章状态）→ `docs/design/author-work-transition-resolution.md`（含两条附记）→ `docs/design/product-constitution.md`。你原来那份交接单仍是第一章机制/代码地图/红线的权威，未过时。
- 所有红线原样有效：Supabase/RLS 七条、部署红线（只跑本仓 `./deploy.sh`）、勿做清单、fail-loud 条款。
- 已合并的 `wip/worlds-recueil-testimonials-2026-07` 远端分支尚未删除（可选清理）。
- 本机 5174 端口可能仍有 dev server 在跑（Claude 留给作者体验用），复用或停掉均可。

## 6. 下一步（建议序，均未开工）

1. **外部访客测试**：第九条闸门五条验收只有作者本人（知情人）走过，尚无不知情访客证据。找 1–2 人零说明体验，记录卡壳点。
2. **部署 = 公开发布决定**：待作者点名。上线 checklist：是否执行 `setup_testimonials.sql`（不执行则寄语簿只读降级，可接受）→ `./deploy.sh` → 核对 health.json buildTime 与域名/IP 一致。
3. **第二章**：按阶段 D，须先出**三个视觉/机制真正不同**的方向供作者选，不得复制第一章三幕模板。
4. 悬置小项：工具层班级资料页是否匿名化（作者未拍板）；Vocabulary chunk 659kB 优化；Limite relief 重做（须作者点名）。
