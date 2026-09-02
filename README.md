# Raccord

> 同一件作品,三种目光。⬜ 未首发。

[![License: MIT](https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square)](LICENSE)

**Raccord** 是一个作者数字作品站——数学班是它的出生坐标,但它不再是"班级官网"。
目前**没有上线**:`raccord.rucmathclass.com` 是 301 跳回主站的占位,2026-08-06 作者明示暂缓首发。
第一章 **《Le ciel de Poincaré》** 已于 2026-07-23 获作者认可成立。

> 本仓 2026-08-25 自 [`rucmathclass`](https://github.com/jsfjsf20070513-a11y/rucmathclass) 拆出(完整保留共同历史)。
> 线上 `rucmathclass.com` 属于那边的班级网站线,与本仓互不部署。

## 三个世界

三个世界不是三个功能部门,而是同一件作品当前使用的三种表现形式:

| 世界 | 表现语言 | 谱系 |
|---|---|---|
| **Carnet** | 纸页:边注、驻留显影 | `#fbfaf6 / #201d1a / #7f302b`,EB Garamond + Noto Serif SC |
| **PLAN ℝ** | 工程图:方格与制图结构 | `#efede6 / #171716 / #2e3fbd`,主标题 Archivo 900 |
| **Limite** | 暗色仪器:无量纲载荷试验 | `#12100e / #e9e3d9 / #d9614d`,Archivo + JetBrains Mono |

当前 edition 以同一件 `Raccord 01` 连续曲线贯穿三界:PLAN 用 Bézier 控制柄把两段曲线从 G⁰ 接向 C²,Limite 把同一曲线置于 A350 启发的载荷试验,Carnet 以 Cauchy / Bergson 的边注追问连续与同一。控制柄是三界共享且持久化的对象(`localStorage.raccord_artifact_v1`),数值逻辑保持在 `components/material/raccordWorldMath.js` 的可测试纯函数里。

站面不出现作者姓名与班级信息(2026-07-23 拍板);Web3 前端已退役,链上程序与文档已于 2026-09-02 删除(历史在 git)。

## 分支

- `main` — 干净基线(2026-08-06 切换改造合并后),留作首发发布源。
- `wip/horizon-immobile`、`codex/world-chapter-constitution` — 2026-08-10 停工时的两个平行方向快照(Horizon 页 vs 产品宪法 v2),复工第一件事是裁定主方向。

## 本地开发

```bash
npm install
npm run dev
```

质量闸:

```bash
npm run lint && npm test && npm run build
```

`predev` / `prebuild` 自动运行定理预渲染与 health 生成。

## 数据库与安全

与 `rucmathclass` **共用同一个 Supabase 项目**,RLS 是唯一且共享的安全边界:

- 权威 RLS 状态是 [`harden_rls.sql`](harden_rls.sql);建表按需执行 `setup_*.sql`。
- `comments.user_email` 对 anon 遮蔽;角色提升只经 `public.is_super_admin()`。
- 寄语表未创建时 `/testimonials` 优雅降级为只读。
- AI / 语音密钥只存在于共享 Cloudflare Worker(`mathclass-ai`)的 secrets;**Worker 配置正本在班级侧仓**,本仓首发前需把 raccord 路由与 CORS 源合并进那边的配置再部署。

## 部署(首发时)

发布源 = 本仓 `main`。必须显式:

```bash
MATHCLASS_DEPLOY_DIR=/var/www/raccord/dist \
MATHCLASS_DEPLOY_HOST=<host> MATHCLASS_DEPLOY_USER=<user> MATHCLASS_DEPLOY_SSH_KEY=<key> \
./deploy.sh
```

`MATHCLASS_DEPLOY_DIR` 漏设会落到班级站的线上目录——绝不允许;真实班级照片永不随 Raccord 部署。完整步骤见 [`deployment/RACCORD_DEPLOY.md`](deployment/RACCORD_DEPLOY.md)。

## License

[MIT](LICENSE)
