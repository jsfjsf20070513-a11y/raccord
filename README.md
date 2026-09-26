# Raccord

Raccord 是一个独立的交互作品。目前只有入口和《Le ciel de Poincaré》这一章。

入口可以选择 PLAN、Carnet 或 Limite。三处串起一个小探索：在 PLAN 留下两个不同的起点，在 Carnet 找回其中一个，再到 Limite 推进它的未来。每处都有中文动作提示，完成后会留下发现记录，也可以自由往返。

PLAN 支持拖动、点按和方向键。Carnet 可以展开笔迹、选择最近七个起点重试。Limite 支持按住推进、松手暂停，也能用按钮或时间滑杆观察、重放。结果显示实际计算的间距倍率；红线对应模型首次达到起始间距 18 倍的位置，没有达到就不画红线。轨迹进度不是现实时间，画面是三维模型的抽象表达。

这是纯静态 React 应用，没有账号、数据库、AI 接口或后台。图片和字体随站点一起提供。浏览器存储不可用时仍能体验，只是不保证刷新后保留记录。

## 开发

使用 `.nvmrc` 指定的 Node 版本。

```bash
npm ci
npm run dev
```

提交前运行：

```bash
npm run check
npm run build
```

`check` 包含架构检查、lint 和测试。构建结果在 `dist/`，不会改动源码。`npm run preview` 可以预览构建结果。

## 代码怎么找

| 目录 | 放什么 |
| --- | --- |
| `src/app/` | 路由、页面外壳、404，以及入口和章节的组合 |
| `src/entrance/` | 选世界的入口；桌面、手机各有自己的组件 |
| `src/chapters/poincare/` | 庞加莱章节、三界页面、绘图和状态保存 |
| `src/chapters/poincare/domain/` | 轨迹计算和状态变化；不依赖 React 或浏览器 |
| `src/shared/` | 世界选择、屏幕尺寸、本地存储适配、通用指针与材质、全局样式 |
| `scripts/` | 架构检查、构建元信息和静态发布 |

依赖方向由 `scripts/check-architecture.mjs` 检查：应用层组合入口和章节；入口、章节可以使用共享代码；共享代码不能反向依赖页面。不同章节不能直接引用彼此的实现。纯计算目录不访问浏览器。

桌面与手机以 760px 为界，每次只挂载一套页面。章节状态由路由上方持有，切换世界、返回入口、调整窗口都使用同一份状态。

## 本地记录

- `raccord_world_v1`：最近的世界。
- `raccord_visited_v1`：是否已进入作品。
- `poincare_sky_v1`：初始位置、最近七个起点及各自看过的最远进度、第一道痕迹和三项探索的发现记录。选回一个起点后可以从头重放，旧结果仍留在记录里。

旧版本的 `carnet_world`、`carnet_visited` 只用于读取已有选择，之后写入新键。没有迁移或删除任何云端数据。

## 发布

普通开发不需要环境变量。正式域名通过 `RACCORD_SITE_URL` 提供；配置后构建会生成对应的 canonical 和 sitemap。未配置时不猜测域名。

发布步骤见 [deployment/RACCORD_DEPLOY.md](deployment/RACCORD_DEPLOY.md)。`health.json` 在构建时生成，包含应用名、版本、源码提交和构建时间。仓库中的模板不代表线上已经部署。

历史实现和旧设计记录留在 Git 历史中，不作为当前代码说明。现在的代码事实以实现和检查结果为准。
