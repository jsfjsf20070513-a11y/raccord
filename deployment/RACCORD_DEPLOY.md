# Raccord 的运行和发布边界

Raccord 与班级网站是两个仓库。下面的目标由当前代码和配置固定，不根据旧说明推断线上状态。

| 项目 | Raccord 的目标 |
| --- | --- |
| Git | `raccord` 仓库的 `main` 分支 |
| 网页 | `raccord.rucmathclass.com` |
| 静态目录 | `/var/www/raccord/dist` |
| 构建标记 | `health.json` 中的 `app: Raccord` |
| Worker | `raccord-ai`，只绑定 Raccord 子域的聊天和语音路由 |
| 数据库 | 独立 Supabase 项目，使用 `VITE_RACCORD_SUPABASE_URL` 和 `VITE_RACCORD_SUPABASE_ANON_KEY` |

班级站保留原库。Raccord 不复制其中的账号、对话、背词进度或其他个人记录。旧的 `VITE_SUPABASE_*` 配置不会被读取；即使把已知班级站地址填进新变量，客户端和发布检查也会拒绝它。

## 新数据库

只在确认过项目身份的新 Supabase 项目中执行 [初始化 SQL](../sql/initialize_independent_database.sql)。脚本在一个事务里建立当前路由需要的六张表及行策略：个人进度、个人对话、公开书目、私有资源增补队列、来源附录和账号角色。它不创建旧相册或存储桶，不复制数据，也不自动指定管理员。已有目标表时会停止，避免在旧库上误跑。

新项目关闭新表自动公开授权，并开启自动行隔离。公开书架和来源附录只读；个人记录按账号限制；资源增补只有本人和原管理员规则可见。注册资料不能授予管理员权限。初始化结果需要从实际数据库再次核对，文件存在不代表已经执行。

## 本地运行

复制 `.env.example` 为本地环境文件，填独立项目的公开客户端配置。运行 `npm run dev`；需要本地 AI 接口时另运行 `npm run worker:dev`。开发代理只连接 `127.0.0.1:8787`，不会把请求送进班级站。Worker 密钥放在未跟踪的 `worker/.dev.vars`，不要复制班级站的生产密钥。

`npm run lint`、`npm test`、`npm run build` 是基础检查；Worker 还跑 `npm run worker:check`，只打包不部署。测试覆盖错误仓库、分支、发布目录、数据库配置和构建标记，以及独立库的访问规则。测试使用构造数据，不连接生产。

## 发布

`bash deploy.sh` 和 `npm run deploy:check` 默认只检查本地。提供 `RACCORD_DEPLOY_HOST`、`RACCORD_DEPLOY_USER`、`RACCORD_DEPLOY_SSH_KEY`，密钥必须是文件的绝对路径。目录固定，旧的 `MATHCLASS_DEPLOY_*` 变量不会被采用。

检查要求正确仓库、`main` 分支、干净工作区和独立数据库配置；数据库必须使用 HTTPS，不能指向本机开发地址。随后运行 lint、测试及新构建。构建后还原自动生成的 health 时间戳，检查期间提交发生变化或构建标记不符就停止。

只有用户明确授权发布后才能使用 `bash deploy.sh --publish`；它才会执行 SSH 和 rsync。Worker 单独发布到 `raccord-ai`，必须单独配置密钥，不能使用班级站的 Worker 名称或路由。两站的限流 namespace 也不同，因为同账号下相同 namespace 会共享计数，见 [Cloudflare 官方说明](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)。

2026-09-27 只读核查服务器时，班级站静态目录存在，Raccord 的静态目录和 Nginx 站点尚未启用；默认站点会把未匹配的域名跳回班级站。仓库中的 Raccord 配置是待发布配置，不能据此声称 Raccord 已上线。新库建立、网页发布和 Worker 发布是不同步骤，分别核对实际结果。
