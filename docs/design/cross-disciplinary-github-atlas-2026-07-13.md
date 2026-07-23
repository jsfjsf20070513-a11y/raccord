# 跨学科 GitHub 项目开眼界图谱 · 2026-07-13

> 这是一份方向研究，不是功能清单或产品宪法。它收集可借鉴的认知机制，但不要求每个世界都生产可验证产物，也不把案例硬塞进现有三世界。美、材质与感知本身也可以成为正当体验；约束以 [`product-constitution.md`](product-constitution.md) 为准。

## 结论先行：我们此前把“网站功能”误当成了“世界”

`AI 助手 / 留言墙 / 资源索引 / 背词` 都是功能名，不是存在理由。它们回答“页面能做什么”，却没有回答“用户离开时，世界或自己发生了什么”。如果只多出一次对话、一条消息或一个不可核验的生成物，既没有改变对象，也没有留下真实感知余韵，视觉再精致也只是在包装空循环。

本轮强候选反复出现的是另一种结构：

```text
有边界的对象或语料
        ↓
有认知含量的动作
        ↓
证据、实验、规则或他人校验
        ↓
可追踪、可复用、可修订的产物
        ↓
对象继续变化，用户有理由回来
```

这些研究型项目最值得学习的不是“历史网站”“数学游戏”或“AI 工具”的题材，而是它们发明了什么动词：重算、构造、证明、标注、对齐、反驳、观测、校验、复演、治理。这些动词是灵感库，不是三个世界的固定国界；一个世界也可以首先成立为不可替代的审美与感知经验。

这也解释了当前方向为什么显得俗：

- **AI 被当成目的地**：空白聊天框要求用户自己带问题、材料和判断标准来，网站没有提供独特对象。
- **参与被误解为发言**：留言墙积累的是无上下文话语，不是可继续使用的公共知识。
- **资源被误解为索引**：分类和搜索只能减少寻找成本，不会自动产生关系、问题或判断能力。
- **练习被误解为重复**：背词尚有真实需求，但若没有错误结构、语义关系、长期状态和迁移场景，也只是更漂亮的闪卡。
- **视觉曾被当成补救**：美可以独立成立，但前提是材质、字体、比例和动效共同构成不可替代的感知对象；它不能只替空功能遮羞。

## 扫描口径

- 只查看项目自己的 GitHub、官网、机构项目页、官方文档或项目论文；不以二手榜单和 star 数量作价值判断。
- 五条检索线累计检查 **99 条项目记录**：历史/档案 15、地理/空间 17、数字人文/知识组织 13、数学/物理/化学/哲学 26、AI/公民科学/创意编程 28。
- 因 ORBIS、Photogrammar、Eterna、Teachable Machine 等跨线重复，按名称和项目族去重后为 **80+ 个独立项目/平台**。NYPL Space/Time、Zooniverse/Panoptes 等按项目族还是单仓计算会改变个位数，因此不制造伪精确数字。
- 正文保留 **20 个强候选**，按“用户做了什么认知动作”而非学科分组；另列 **8 个容易学错的反例**。
- 筛选问题固定为：真实用途是什么？核心循环能否重复？产物能否验证和留下？为什么会回访？若视觉不是核心，去掉表面后还剩什么机制；若视觉就是核心，它是否不可替代？

## 一、改变规则，让世界重新运行

### 1. ORBIS — 把历史地理变成可质疑的阻力模型

- **一手入口**：[emeeks/orbis_stanford](https://github.com/emeeks/orbis_stanford) · [Stanford ORBIS](https://orbis.stanford.edu/) · [ORBIS v2 说明](https://digitalhumanities.stanford.edu/orbis-v2/)
- **真实用途**：计算古罗马世界中不同季节、运输方式、费用和换乘惩罚下的路线，而不是查询一张静态古地图。
- **独特机制**：用户改变起终点、月份、媒介或网络节点，系统重算最快、最短或最便宜的路径；v2 还能关闭路线、移除城市、按旅行时间重绘地图。
- **新认知 / 回访**：地理距离不等于社会经济距离；换一种季节、代价函数或网络假设，帝国会呈现另一种形状。回访来自再次提出条件不同的问题。
- **价值密度**：**5/5**。几乎每个控件都改变解释，没有无关模块。
- **可迁移机制**：`提出假设 → 改变参数 → 运行模型 → 并排比较 → 暴露敏感参数`。世界形态随推理结果变化，而不只是更新一个数字。
- **局限**：速度、价格和网络都来自历史重建；精致路线容易让人把模型输出误认成确定事实。

### 2. OpenRelativity — 把不可感的物理常数移到身体尺度

- **一手入口**：[MITGameLab/OpenRelativity](https://github.com/MITGameLab/OpenRelativity) · [MIT Game Lab 项目页](https://gamelab.mit.edu/research/openrelativity/)
- **真实用途**：`A Slower Speed of Light` 降低光速，让玩家通过移动经历洛伦兹收缩、相对论多普勒效应等现象；开源工具允许继续制作场景。
- **独特机制**：玩家的移动就是实验输入，整个可见环境持续服从同一组相对论规则。项目同时公开移动物体、光照、阴影和精度方面的模拟限制。
- **新认知 / 回访**：公式中的极端条件变成身体经验；改变速度、方向和场景会形成不同反事实直觉。
- **价值密度**：**4.5/5**。一个规则改变整件体验，不靠附加动画制造“科学感”。
- **可迁移机制**：把一个平时不可感的常数、边界或约束移到感官尺度；所有交互服从同一法则；同时标出模拟失效处。
- **局限**：GPU 与 3D 成本高；视觉奇观可能压过概念；简化模拟不能替代完整物理模型。

### 3. NetLogo — 从微观规则观察宏观秩序怎样长出来

- **一手入口**：[NetLogo](https://www.netlogo.org/) · [NetLogo/NetLogo](https://github.com/NetLogo/NetLogo) · [官方说明](https://docs.netlogo.org/whatis.html)
- **真实用途**：用 agent-based modeling 表达生态、经济、城市、传播等系统，让学习者修改个体规则并运行可重复实验。
- **独特机制**：少量局部规则通过大量主体反复执行，生成难以凭直觉预判的整体图样；模型代码、参数和结果都能留下。
- **新认知 / 回访**：用户不只看见结果，而会追问“是哪个微观假设造成了这个宏观现象”；下一次回访自然是改规则、换初值、做对照。
- **价值密度**：**5/5**。模型本身同时是解释、实验装置和可争论假设。
- **可迁移机制**：`写明微规则 → 运行多主体过程 → 观察涌现 → 改一条规则 → 比较情景`。
- **局限**：简洁规则可能掩盖真实系统的制度与历史条件；漂亮涌现不等于模型得到实证支持。

### 4. The Evolution of Trust — 让哲学判断变成可运行的互动系统

- **一手入口**：[ncase/trust](https://github.com/ncase/trust) · [The Evolution of Trust](https://ncase.me/trust/)
- **真实用途**：通过可操作的重复博弈解释合作、背叛、错误率、记忆长度和群体构成怎样共同影响信任。
- **独特机制**：概念不是先由长文解释，再配一个小游戏；每段论点都通过可操纵模型成立或失效，读者能主动破坏作者的默认条件。
- **新认知 / 回访**：用户会发现“善良/自私”的道德标签不足以解释系统结果；噪声和互动结构同样关键。不同策略组合可继续生成问题。
- **价值密度**：**4.5/5**。叙事、模型和反例围绕同一命题推进。
- **可迁移机制**：把抽象命题拆成能被用户反驳的最小模型；解释只在模型要求它出现时出现。
- **局限**：博弈模型高度抽象；顺畅叙事可能让读者忽略现实制度、权力和历史差异。

## 二、构造对象，并接受严格反馈

### 5. Natural Number Game / Lean — 产物不是答案，而是机器可核验的证明

- **一手入口**：[leanprover-community/NNG4](https://github.com/leanprover-community/NNG4) · [Lean Game Server](https://adam.math.hhu.de/)
- **真实用途**：学习者从 Peano 公理和少量规则出发，在逐级世界中写 Lean 证明；类型检查器只接受真正构成合法证明的对象。
- **独特机制**：每一步受已解锁定义、定理和 tactic 约束；错误信息指向对象为什么不合法，而不是只给红叉。通过关卡后留下的是可再次检查的证明。
- **新认知 / 回访**：用户看到“直觉上显然”和“形式上充分”的差距；后续规则、不同证明路径和可复用技能形成自然进阶。
- **价值密度**：**5/5**。学习动作、反馈和耐久产物完全一致。
- **可迁移机制**：`少量规则 → 自由构造 → 严格验证 → 解释失败 → 解锁新表达能力`。系统检查用户的对象，不替用户完成对象。
- **局限**：学习者可能只会拼 tactic；机器通过不等于证明适合人类阅读；形式化语法有门槛。

### 6. Eterna — 从虚拟 RNA 设计走到真实实验反馈

- **一手入口**：[Eterna](https://eternagame.org/) · [eternagame/EternaJS](https://github.com/eternagame/EternaJS)
- **真实用途**：玩家学习 RNA 折叠规则、提出分子设计；社区筛选的候选进入实验室合成和测试，结果再回到平台。
- **独特机制**：`模拟内设计 → 社区比较 → 湿实验 → 数据回流 → 修正模型和下一轮设计`。玩家不是替项目点标签，而是在约束中提出可实验对象。
- **新认知 / 回访**：用户能看到能量模型何时有效、何时被真实实验推翻；会回来等待自己的设计结果，并用失败数据改下一轮方案。
- **价值密度**：**5/5**。学习、游戏、社区和科研产出进入同一闭环。
- **可迁移机制**：虚拟操作尽量通往外部证据；失败必须回流并改变判断；社区围绕对象质量协作，不围绕人气动态。
- **局限**：学习成本和实验资源都高；绝大多数网站无法复制湿实验条件，只能学习闭环。

### 7. Argdown — 把观点编译成可攻击、可修订的论证结构

- **一手入口**：[Argdown](https://argdown.org/) · [argdown/argdown](https://github.com/argdown/argdown) · [Browser Sandbox](https://app.argdown.org/)
- **真实用途**：用接近 Markdown 的文本写主张、前提、结论及 support、attack、undercut 等关系，并实时编译成论证图。
- **独特机制**：文字与图不是两份内容；图是源文本的另一种编译结果。修改前提或关系后，宏观攻防结构同步改变。
- **新认知 / 回访**：写作者被迫区分反对结论、反对前提和反对推导；随着反例和版本增加，论证对象可持续重构。
- **价值密度**：**4.5/5**。少量语法真正改变思考动作，而不是给评论区加连线。
- **可迁移机制**：贡献必须明确对象与关系类型；反对锚定具体节点；同一源材料可生成多个一致视图；版本差异也是材料。
- **局限**：结构清楚不等于命题为真；大图容易失读；形式关系会损失修辞和历史语境。

### 8. Teachable Machine — 用户亲手制造模型，也亲手击穿模型边界

- **一手入口**：[Teachable Machine](https://dev.teachablemachine.withgoogle.com/) · [googlecreativelab/teachablemachine-community](https://github.com/googlecreativelab/teachablemachine-community)
- **真实用途**：在浏览器中采集图像、声音或姿态样本，训练分类模型，立即测试并导出到其他作品。
- **独特机制**：`Gather → Train → Test → Export` 极短；训练集的缺陷会立刻以误分类返回，AI 不再是神谕，而是用户材料的镜子。
- **新认知 / 回访**：用户会追问哪些样本代表性不足、哪些反例击穿模型、换数据后边界如何变化。真正的回访通常由下一件作品或实验驱动。
- **价值密度**：**4/5**。教学反馈极强，但若没有后续问题，单次新鲜感很快耗尽。
- **可迁移机制**：让用户构造训练材料、直观看见失败、保存版本和反例；AI 给出可检验行为，不以聊天文本占据舞台。
- **局限**：很容易退化成香蕉/手势分类玩具；没有数据卡、反例集和偏差审计，就不会形成长期认知对象。

## 三、重排证据，在整体与细节之间往返

### 9. Photogrammar — 同一批照片需要多副彼此不同的观察镜片

- **一手入口**：[americanpanorama/photogrammar](https://github.com/americanpanorama/photogrammar) · [项目介绍](https://www.photogrammar.org/intro) · [方法说明](https://photogrammar.org/about)
- **真实用途**：探索 FSA/OWI 的历史照片，通过地点、层级主题、时间、摄影者和原始胶卷顺序进入同一 corpus。
- **独特机制**：元数据不是说明栏，而是五种重排方式；尤其胶卷顺序恢复摄影者移动、反复取景、放弃和选择的制作过程。
- **新认知 / 回访**：用户不仅看到名作，还看到采集范围、机构分类和摄影实践怎样共同塑造历史图像。换一种索引，就会出现不同叙事。
- **价值密度**：**5/5**。宏观分布、对象近读和生产过程都由同一材料长出。
- **可迁移机制**：为同一 corpus 设计数个具有认知差异的重排方式；近读后必须能找回对象在全局中的位置；保留生成顺序。
- **局限**：元数据偏差会被宏观视图放大；大规模图像探索对移动端、性能和无障碍都很困难。

### 10. Mapping Inequality — 让空间判断始终贴着原始证据

- **一手入口**：[panorama-holc](https://github.com/americanpanorama/panorama-holc) · [holc2](https://github.com/americanpanorama/holc2) · [Mapping Inequality](https://dsl.richmond.edu/panorama/redlining/) · [About](https://dsl.richmond.edu/panorama/redlining/about)
- **真实用途**：把 HOLC 地图、街区说明扫描件、转录和数字化空间图层放进同一调查界面。
- **独特机制**：点选街区后，原始扫描、精确转录、等级图层和解释同步；宏观格局随时能落回具体行政语言和档案原件。
- **新认知 / 回访**：结构性歧视不再是抽象口号，而成为分类语言、制度文件和城市空间共同生产的结果；用户可以沿城市、词语或街区多次进入。
- **价值密度**：**5/5**。地图用于核验，不只是展示。
- **可迁移机制**：`原件 ↔ 精确转录 ↔ 解释模型` 三联；任何漂亮抽象都必须回答“凭什么”，并能返回证据与口径。
- **局限**：视觉相关性不能自动证明因果；高度专门的美国语境不能去语境化挪用。

### 11. Impresso — 把传播关系、近读和可复现分析闭成一环

- **一手入口**：[Impresso GitHub organization](https://github.com/impresso) · [项目官网](https://impresso-project.ch/) · [Text Reuse at Scale](https://impresso-project.ch/news/2024/02/05/new-release.html) · [Datalab](https://impresso-project.ch/news/2025/09/18/major-release.html)
- **真实用途**：在多语种历史报纸与广播材料中追踪人物、地点、主题和复用段落，并把网页查询带入 notebook 深挖，再回原文核对。
- **独特机制**：同一传播现象可在两段文本的并置近读、复用簇的语料总览、可运行 notebook 和原始报刊之间往返。
- **新认知 / 回访**：用户看到同一叙事怎样被转载、改写、越境和再语境化；保存的查询和集合能承接新材料与新问题。
- **价值密度**：**5/5**。发现、计算与回证据围绕一个问题服务。
- **可迁移机制**：对象同时保留 `原件 / 关系 / 总览 / 可复现查询`；可视化点击必须回到证据；查询本身成为可继续工作的状态。
- **局限**：OCR、实体识别和文本复用都有概率误差；跨语种与版权基础设施远超小型站点承受范围。

### 12. Newspaper Navigator — 让旧报纸摆脱关键词唯一入口

- **一手入口**：[LibraryOfCongress/newspaper-navigator](https://github.com/LibraryOfCongress/newspaper-navigator) · [项目论文](https://arxiv.org/abs/2005.01583)
- **真实用途**：从历史报纸页面中提取标题、照片、插画、地图、漫画和广告，并通过视觉相似性探索，而不只依赖 OCR 关键词。
- **独特机制**：一张扫描页被重新切成可比较的视觉对象；用户能从一张图进入视觉近邻，同时随时返回原版面，观察“被裁出”带来的意义变化。
- **新认知 / 回访**：同一天不同地区的视觉文化、广告母题和新闻图像会聚成意外邻域；每个种子对象都能打开不同路线。
- **价值密度**：**4.5/5**。材料、机器识别和探索机制高度收束。
- **可迁移机制**：从对象生成“相似但不相同”的邻域；公开系统为何形成这种邻近；保留从对象回原始上下文的路径。
- **局限**：检测类别和向量近邻会把模型偏差包装成自然空间；裁切可能抹掉版面语境。

## 四、把个人判断变成耐久公共知识

### 13. OEIS — 一个私人模式如何进入公共数学网络

- **一手入口**：[OEIS](https://oeis.org/) · [贡献流程](https://oeis.org/wiki/Overview_of_the_contribution_process) · [oeis/oeisdata](https://github.com/oeis/oeisdata)
- **真实用途**：检索整数序列的定义、公式、程序、文献和相关序列，也能提交新序列、补充结果和纠错。
- **独特机制**：贡献经历查重、proposal、review、approval、live；条目获得稳定 A-number，猜想与定理被明确区分，编辑讨论成为永久记录。
- **新认知 / 回访**：偶然模式会连接到组合、图论或几何；上线对象仍能被他人推导、引用和修订。
- **价值密度**：**5/5**。搜索、证据、程序、文献和审核全围绕稳定对象。
- **可迁移机制**：`查重 → 定义 → 示例 → 证据 → 关联 → 审核 → 稳定标识`。贡献必须能被后来者继续使用。
- **局限**：对象类型窄、编辑门槛高；小型社区未必有足够审核力量。

### 14. Recogito Studio — 参与不是发言，而是标注、对齐和校验

- **一手入口**：[recogito/recogito-studio](https://github.com/recogito/recogito-studio) · [Recogito Studio](https://recogitostudio.org/) · [官方概览](https://recogitostudio.org/guides/overview/)
- **真实用途**：团队标注 TEI、IIIF 和 PDF，将地点、人物、事件或图像区域与共享词表、gazetteer 对齐，再导出标准化注释。
- **独特机制**：选中具体片段，标注实体，做 reconciliation，再在地图或关系视图中检查；层、任务、版本和 provenance 让分歧可见。
- **新认知 / 回访**：近读直觉被显式化为可复核关系；未决标注、冲突对齐和逐渐生长的知识图构成持续工作。
- **价值密度**：**4.5/5**。参与者离开时自己更懂，公共对象也真实变好。
- **可迁移机制**：贡献动作应是标注、归类、对齐、校验和补证据等 epistemic labor，并记录版本、分歧与来源。
- **局限**：需要好语料、明确问题和审核；否则会退化为复杂标注软件。

### 15. iNaturalist — AI 只提出候选，社区把观察变成科学数据

- **一手入口**：[iNaturalist About](https://www.inaturalist.org/pages/about.html) · [inaturalist/inaturalist](https://github.com/inaturalist/inaturalist)
- **真实用途**：记录带时间、地点和影像的自然观察；系统给出识别候选，观察者选择，社区继续鉴定，满足条件后形成可供研究使用的数据。
- **独特机制**：`现场观察 → AI 建议 → 人类选择 → 社区复核 → 研究级记录`。AI 位于证据链中间，既不取代观察，也不拥有最终解释权。
- **新认知 / 回访**：用户等社区鉴定、追踪季节和地点变化、完成长期观察项目；个人记录还会进入更大生态分布。
- **价值密度**：**5/5**。一次微小观察同时服务个人学习和公共研究。
- **可迁移机制**：AI 生成可反驳候选；贡献绑定原始证据、时间和位置；质量通过多人判断与规则升级。
- **局限**：地理和物种覆盖不均；拍摄偏差、误鉴定与隐私位置需要治理。

### 16. StreetComplete — 一个现场微判断，直接修好公共地图

- **一手入口**：[streetcomplete/StreetComplete](https://github.com/streetcomplete/StreetComplete)
- **真实用途**：在用户附近提出可以现场确认的简短问题，把答案直接转成有意义、可追踪的 OpenStreetMap 编辑。
- **独特机制**：问题必须能由肉眼现场判断，且每个回答对应明确数据字段；地图不是任务背景，而是被贡献动作真实改变的公共对象。
- **新认知 / 回访**：用户开始注意日常空间里原本忽略的细节；附近会持续出现新建、变化或待复查对象，贡献立即进入公共地图。
- **价值密度**：**5/5**。任务短，但后果真实而耐久。
- **可迁移机制**：把复杂维护拆成 `现场可判断的小问题 → 结构化变更 → 版本记录 → 公共复用`。
- **局限**：只适合可现场验证的事实；错误与争议仍需要 OSM 社区治理；不能把“微任务”脱离真实受益对象复制。

### 17. Mozilla Common Voice — 把微小贡献汇成开放语言基础设施

- **一手入口**：[Mozilla Common Voice](https://commonvoice.mozilla.org/) · [common-voice/common-voice](https://github.com/common-voice/common-voice)
- **真实用途**：志愿者朗读句子、听取并验证录音、补充句子，逐渐形成可公开使用的多语种语音数据集。
- **独特机制**：贡献被拆成低门槛但有质量门槛的录制与验证；个人声音不是内容流，而是汇入开放数据版本，供语音技术和研究继续使用。
- **新认知 / 回访**：用户能看见自己语言的覆盖、验证进度和新数据发布，也能理解 AI 数据并非自然出现，而由具体人和语言政治共同构成。
- **价值密度**：**4.5/5**。微贡献与公共基础设施直接相连。
- **可迁移机制**：把公共资源拆成生产与独立验证两类动作；显示覆盖缺口、版本和下游用途；贡献协议必须清楚。
- **局限**：语种和人口覆盖仍不均；同意、隐私、录音质量与数据被如何使用都是核心治理问题。

### 18. Zooniverse / Panoptes — 众包只有接入真实研究协议才成立

- **一手入口**：[Zooniverse About](https://www.zooniverse.org/about) · [zooniverse/panoptes](https://github.com/zooniverse/panoptes) · [front-end monorepo](https://github.com/zooniverse/front-end-monorepo)
- **真实用途**：真实研究团队把图像、音频或文本判断拆成志愿者可完成的分类任务，并通过多人冗余、讨论和聚合生成研究数据。
- **独特机制**：同一 subject 由多人独立判断，结果按研究协议聚合；异常对象可进入讨论，成果最终应回流到数据集、论文或项目更新。
- **新认知 / 回访**：新 subject、新研究项目、个人贡献记录和最终科研成果提供回访理由；前提是参与者能看见贡献如何被使用。
- **价值密度**：**4/5**。协议完整时很强，只抄分类卡片则价值接近零。
- **可迁移机制**：`真实研究问题 → 可解释微判断 → 多人冗余 → 质量控制 → 公开成果回流`。
- **局限**：没有研究方、聚合规则、署名和反馈时，微任务会退化为无偿劳动。

## 五、把代码变成乐器，把知识边界变成内容

### 19. Hydra — 代码不是后台工具，而是可复演的现场乐器

- **一手入口**：[hydra-synth/hydra](https://github.com/hydra-synth/hydra) · [Hydra](https://hydra.ojack.xyz/)
- **真实用途**：在浏览器中用代码实时合成、反馈和混合视觉信号，用于 live coding、演出、教学与远程影像协作。
- **独特机制**：每次修改立即改变持续运行的视觉；代码既是作品、谱面，也是可复制、remix 和继续演化的过程记录。
- **新认知 / 回访**：用户通过演奏理解反馈、调制和信号流，而不是先读抽象教程；排练、演出、remix 和协作自然要求回来。
- **价值密度**：**4.5/5**。输入、反馈和产物同属一个媒介。
- **可迁移机制**：让规则成为可演奏材料；缩短表达与感知反馈之间的距离；保留可复演的“谱”，不只保存最终截图。
- **局限**：若没有策展命题、作品文化和表演语境，只剩一个容易令人兴奋十分钟的代码画布；视觉噪声也容易失控。

### 20. Mukurtu CMS — 谁能看、谁能解释，本身就是知识的一部分

- **一手入口**：[MukurtuCMS/mukurtucms](https://github.com/MukurtuCMS/mukurtucms) · [Mukurtu](https://mukurtu.org/) · [文化协议文档](https://docs.mukurtu.org/communities-cultural-protocols-categories/SharedProtocols/)
- **真实用途**：原住民社区、图书馆、档案馆和博物馆按文化协议管理数字遗产，为同一物件保留不同社区记录和访问边界。
- **独特机制**：权限不是后台设置，而与来源、解释权和文化语境同级；同一对象不必只有一个权威说明，Traditional Knowledge Labels 补充普通版权框架。
- **新认知 / 回访**：访问者意识到档案并非中立容器；社区成员会因记录、叙述、词典和协议持续演化而回来维护。
- **价值密度**：**4.5/5**。少数根本机制改变了“数字档案是什么”。
- **可迁移机制**：材料必须带来源、授权、适用人群、叙述者和修订历史；多视角可以并存，但边界不可被装饰性消解。
- **局限**：这些机制来自具体原住民知识治理实践，不能被去语境化挪用；可学的是“治理即内容”的原则，不是文化符号。

## 八个容易学错的反例

这些项目本身不一定差；淘汰的是“把它当成一个世界核心”的判断。

### 1. Voyant Tools：通用分析驾驶舱没有自己的问题

[Voyant Tools](https://github.com/voyanttools/Voyant) 是成熟的文本分析工具，但只有在用户已经有语料和问题时才产生意义。若迁移其多面板表面，只会复制当前拥挤和功能堆积。可学跨尺度联动，不学驾驶舱定位。

### 2. Tropy：优秀私人工作流不等于公共认知世界

[Tropy](https://github.com/tropy/tropy) 很适合研究者整理档案照片、元数据、转写和局部注释；但它主要优化个人资料管理。它能教我们如何把材料对象化，不能自动提供公共访问者的共同问题与回访循环。

### 3. Palladio：地图、网络、时间线的合集仍只是工具箱

[Palladio](https://github.com/humanitiesplusdesign/palladio) 对不完整人文数据很诚实，也支持多种探索视图；但它没有自己的 corpus 和问题。若学习方向只是“也提供地图、网络、筛选”，仍会回到功能仓库。

### 4. CollectionBuilder / Wax：建展框架回答不了为何值得进入

[CollectionBuilder](https://github.com/CollectionBuilder/collectionbuilder.github.io) 与 [Wax](https://github.com/minicomp/wax) 是出色的 minimal-computing 建展工作流。它们回答如何稳妥发布集合，不替内容方回答集合为何值得反复观察。

### 5. Programming Historian：高质量文章集合仍然是出版物

[Programming Historian](https://programminghistorian.org/) 的多语种、同行评审教程很有公共价值，源码也在 [GitHub](https://github.com/programminghistorian/jekyll)。但它的核心是编辑出版，不是围绕对象持续生成新关系的互动系统。可学方法透明，不把资源文章重新命名成世界。

### 6. Moral Machine：多数人的选择不自动等于伦理答案

[Moral Machine](https://www.moralmachine.net/) 把自动驾驶伦理转成大规模二选一实验，传播力很强；其研究设计与数据口径见 [MIT 开放论文](https://dspace.mit.edu/bitstream/handle/1721.1/125065/Moral%20Machine%20Paper.pdf)。但二元情境和偏好聚合容易把“人们怎样选”误读成“应该怎样做”。如果没有概念拆解、少数意见和规范推理，它会把哲学缩成投票。

### 7. TensorFlow Playground：调几层网络不会自动形成 AI 素养

[TensorFlow Playground](https://github.com/tensorflow/playground) 能直观看到玩具数据、特征和网络层怎样改变分类边界；但没有真实数据来源、部署对象、失败成本和耐久产物。它适合解释局部概念，不足以单独成为长期世界。

### 8. 通用 vibe coding 工具：更快地产代码，不等于知道该做什么

[bolt.diy](https://github.com/stackblitz-labs/bolt.diy)、[OpenHands](https://github.com/OpenHands/OpenHands)、[Continue](https://github.com/continuedev/continue) 和 [tldraw make-real](https://github.com/tldraw/make-real) 都能缩短意图到软件的距离；Aider 还用 repo map、diff、Git、lint/test 把生成纳入较可检查的工序。但它们解决的是**生产效率**，不提供领域对象、证据标准或公共价值。

因此，vibe coding 可以是幕后生产方式、短期工作坊或表达媒介，不能单独充当世界主题。`画一下 / prompt 一句 → 页面成真` 的高潮常发生在第一次；若没有真实问题、可复核产物和持续演化的对象，它仍是旧 AI 助手的换壳。

## 从 20 个项目抽出的五种认知动作假设

下面只是下一轮讨论的候选动词，不映射现有三个名字，不决定内容，更不进入实现。

### 假设 A：构造与证明

用户从少数规则出发做出一个对象，系统只负责严格反馈；最终留下证明、论证、设计或反例，而不是分数和聊天记录。关键问题是：**我们是否拥有值得被构造、且能被可靠检验的对象？**

### 假设 B：建模、扰动与比较

用户改变常数、微观规则或历史假设，让整个系统重新运行，并把不同情景并排比较。关键问题是：**哪条规则一旦改变，能让用户看到平时不可见的因果结构？**

### 假设 C：观察、重排与追证据

同一批材料通过时间、地点、生成顺序、相似性或传播关系被反复重排；任何总览都能落回原件。关键问题是：**我们是否有一批足够有密度、来源清楚、值得多次换镜片观看的材料？**

### 假设 D：标注、校验与公共积累

参与者完成可解释的小判断，经过独立验证、版本记录和审核，进入后来者能继续使用的公共对象。关键问题是：**一次贡献究竟改变了什么，谁会使用它，错误如何被发现？**

### 假设 E：教学、演奏与治理系统

用户可以亲手教一个模型、演奏一套规则，或决定知识的访问与解释边界；系统本身成为被观察的材料。关键问题是：**技术能否从隐藏的服务层变成一种可感、可批判、可复演的文化实践？**

未来三个世界不必一一对应这五种动作，也不应被现有名字和半成品内容限制。下一步只应先选材料与问题，再判断哪些动作可以形成三条真正不同、又能长期维护的循环。

## 完整扫描覆盖（按项目族压缩）

以下用于说明视野范围，不表示推荐，也不逐项迁移。

- **历史、档案、空间人文**：ORBIS、VIKUS Viewer、Photogrammar、Linked Jazz、American Panorama Forced Migration / Mapping Inequality / Land Acquisition / Overland Trails / Canals、Six Degrees of Francis Bacon、Kindred Britain、Atlascope、Adno、Recogito、Juncture、OpenAtlas、Wax、OpenHistoricalMap、World Historical Gazetteer、SlaveVoyages、NYPL Surveyor / Building Inspector / Map Warper / OldNYC、Pelagios Peripleo、Palladio、OldMapsOnline / TimeMap。
- **数字人文与知识组织**：Impresso、Newspaper Navigator、DraCor、CATMA、Mukurtu、Voyant Tools、Tropy、ResearchSpace、Programming Historian、OpenITI、CollectionBuilder、Omeka S、Wax。
- **数学、物理、化学与哲学**：Natural Number Game / Lean、OEIS、LMFDB、Mathigon、Seeing Theory、Immersive Math、CERN Open Data、GWOSC、Galaxy Zoo、QuarkNet Cosmic e-Lab、OpenRelativity、PhET、Eterna、Materials Project、Open Reaction Database、Avogadro、MolView、Argdown、Moral Machine、The Evolution of Trust、Parable of the Polygons、Open Logic、Teachable Machine、TensorFlow Playground、Sonic Pi、Hydra、tldraw make-real。
- **公民科学与公共知识**：Eterna、Foldit、Zooniverse/Panoptes、iNaturalist、Common Voice、StreetComplete、Open Food Facts/Robotoff、Wikidata/Wikibase、Scholia、Hypothesis。
- **创意编程、AI 与 vibe coding**：p5.js、Processing、Hydra、Sonic Pi、Twine、Scratch、cables.gl、ml5.js、Wekinator、Teachable Machine、Orange Data Mining、NetLogo、marimo、Aider、bolt.diy、OpenHands、Continue、tldraw make-real。

## 最后判断

用户的直觉是对的：此前不是“做得还不够精致”，而是在错误问题上加速。三个世界若要成立，不能再从“加什么功能”开始，而应先各自回答三件事：

1. 用户在这里操作的具体对象是什么？
2. 哪一种关系、动作或感知会真正改变他，而不是只消耗时间？
3. 他离开后，世界中的对象或自己的感知、理解与记忆发生了什么变化？

答不出这三问的页面，无论功能多完整都不值得继续做。AI 若存在，应退到建议、识别、相似度、模拟和质量控制的位置；它帮助用户面对对象，不替代对象，更不再充当世界本身。
