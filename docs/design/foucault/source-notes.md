# Foucault 史料与物理边界 · source notes

> 2026-07-23,阶段 B 产出。只记录与《L'horizon immobile》机制直接相关的事实、来源、可用边界与禁止误述。不是人物专题。

## 1. 已核验史实

| 事实 | 口径 | 来源 |
|---|---|---|
| 1851-02-03 Foucault 向法国科学院提交结果;此前在巴黎天文台子午线厅以约 11 m 摆演示(得 Arago 支持) | 可用 | ScienceDirect《Foucault and the rotation of the Earth》(C. R. Physique, 2017) |
| 1851 年 3 月先贤祠公开演示:钢丝约 67 m,黄铜球内灌铅,直径约 17 cm,质量约 28 kg | 可用 | 同上;巴黎先贤祠官方页佐证 1851 与穹顶悬挂 |
| 1851 年巴黎公众涌入先贤祠观看("la foule parisienne put affluer au Panthéon") | 可用 | Musée des Arts et Métiers 演示页 |
| 今日该馆在 Saint-Martin-des-Champs 教堂穹顶下演示,周二至周日 12h/17h 各约 20 分钟 | 可用(佐证"演示需重新释放") | 同上 |
| 傅科陀螺 1852 年制成,1867 年入藏;铜环 150–200 转/秒,可测出地球自转且**不依赖纬度**,比摆更精确 | 可用(只作暗线/对照,不进画面) | Musée des Arts et Métiers 陀螺页 |

历史原话:本轮未找到带出处页码的可核验傅科原文。**不使用任何"傅科说"**。章名 `L'horizon immobile` 是当代作品语言,已在交接单声明。

## 2. 物理关系(编码前以此为准)

摆动平面在惯性系中保持自身取向;是地面(连同观察者、页面坐标)相对它转动。观察者在地面参照系中看到的是摆动平面的"视进动":

```text
ωp = Ω⊕ · sin(φ)
Ω⊕ = 360° / 86164.0905 s(恒星日)= 15.0411°/h
```

| 手算对拍(§6.1) | 结果 |
|---|---|
| 赤道 φ=0° | 0.000°/h ✓ |
| 北极 φ=90° | 15.041°/h(= Ω⊕)✓ |
| 南半球 φ=−48.8566° | −11.327°/h(反号)✓ |
| 巴黎 φ=48.8566°N | **11.327°/h ≈ 11.3°/h** ✓ |
| 巴黎整周 | 360/11.327 = **31.78 h ≈ 31.8 h** ✓ |
| 先贤祠摆周期 2π√(67/9.809) | ≈ 16.4 s(参考,非本章必用) |

符号约定(北半球):地面系中摆动平面视旋转为**顺时针**(俯视)。实现时以单测锁死符号,南北半球互为镜像。

## 3. 诚实边界

1. **阻尼**:无驱动物理摆必衰减。博物馆或每场演示重新释放(见上 12h/17h 场次),或以驱动装置补偿维持(当代工程通行做法,[通识],画面不涉及具体装置)。作品若允许"访客离开后摆继续",技术文档必须自称 **ideal maintained Foucault pendulum**,不得冒充完整物理复现。
2. **时间压缩**:真实进动 11.3°/h 在一次网页停留中几乎不可见。视觉层可定义 `timeScale` 压缩时间,但领域层保留真实量;页面不显示伪造的真实度数/秒表;QA 文档写明"艺术性时间压缩";不得声称"巴黎实际转这么快"。
3. **航空**:地平线、惯性参照系与飞行只作当代作品暗线。禁止误述:傅科为 A350 设计惯导 ✗;傅科摆 = 现代人工地平仪 ✗;本章是航空仪表历史复原 ✗。
4. **陀螺**:傅科 1852 年的陀螺是摆的"更纯粹后继"(不依赖纬度),本章不将其加入画面,仅在文档层作为"参照系问题不止一种表达"的旁证。

## 4. 禁止误述清单

- 不把摆动平面说成"绝对不动"(它保持的是相对惯性系的关系,严格说还有微小修正;作品语言用"保持自己的关系"即可)。
- 不说"摆证明了地球绕太阳公转"(它演示的是**自转**)。
- 不写"傅科在先贤祠说过……"任何台词。
- 不使用未核验的摆长/质量以外的数字装点画面。

## 5. 来源

- Musée des Arts et Métiers｜Démonstration du pendule de Foucault — arts-et-metiers.net/musee/demonstration-du-pendule-de-foucault
- Musée des Arts et Métiers｜Gyroscope de Foucault — arts-et-metiers.net/musee/gyroscope-de-foucault
- Musée des Arts et Métiers｜官方 PDF(2021-10, cp_pendule_foucault.pdf)— 已存本地副本,文本层不可提取,仅作存档
- ScienceDirect｜Foucault and the rotation of the Earth — sciencedirect.com/science/article/pii/S1631070517301019
- Panthéon 官方 — paris-pantheon.fr/en/discover/foucault-s-pendulum;pantheonparis.org(物理页仅含公式框架)
