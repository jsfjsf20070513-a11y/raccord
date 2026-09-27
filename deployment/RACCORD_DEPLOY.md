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

公开书架和来源附录只读；个人记录按账号限制；资源增补只有本人和管理员可见。注册资料不能授予管理员权限。不要只看控制台的“新表自动公开”开关：此次查到默认授权仍含 TRUNCATE 等操作，初始化脚本会逐表撤销多余授权，后续新表也要明确处理。

2026-09-27 已在独立项目 `zkjwiljxgiockkzrkjui`（新加坡，PostgreSQL 17.6）执行这份初始化 SQL。执行前没有业务表和账号；执行后六张表都开启 RLS，96 项匿名与登录角色表权限符合预期，没有额外列授权或 PUBLIC 授权。注册触发器固定创建普通用户，实时订阅只发布 `resources`。

使用该项目公开客户端配置实际请求接口：`resources`、`testimonials` 的匿名 HEAD 返回 200，其余四张表返回 401。六张表和 Auth 的记录数仍全部为零，没有搬迁数据或指定管理员。本机 `.env.local` 已改为新项目并移除旧共享变量，该文件不入库。使用这份配置的构建已打开书架和登录页核对，无控制台错误。

认证回调尚保持新项目默认值：Site URL 为 `http://localhost:3000`，没有额外 Redirect URLs。Raccord 域名当前仍跳往班级站，首发时再设置自己的域名与 `/reset-password` 回调，并核验真实注册、邮件确认和找回密码；此次没有发送邮件或创建测试账号。数据库初始化完成不代表这些登录流程已经验收。

## 本地运行

复制 `.env.example` 为本地环境文件，填独立项目的公开客户端配置。运行 `npm run dev`；需要本地 AI 接口时另运行 `npm run worker:dev`。开发代理只连接 `127.0.0.1:8787`，不会把请求送进班级站。Worker 密钥放在未跟踪的 `worker/.dev.vars`，不要复制班级站的生产密钥。

`npm run lint`、`npm test`、`npm run build` 是基础检查；Worker 还跑 `npm run worker:check`，只打包不部署。测试覆盖错误仓库、分支、发布目录、数据库配置和构建标记，以及独立库的访问规则。测试使用构造数据，不连接生产。

## 发布

`bash deploy.sh` 和 `npm run deploy:check` 默认只检查本地。提供 `RACCORD_DEPLOY_HOST`、`RACCORD_DEPLOY_USER`、`RACCORD_DEPLOY_SSH_KEY`，密钥必须是文件的绝对路径。目录固定，旧的 `MATHCLASS_DEPLOY_*` 变量不会被采用。

检查要求正确仓库、`main` 分支、干净工作区和独立数据库配置；数据库必须使用 HTTPS，不能指向本机开发地址。随后运行 lint、测试及新构建。构建后还原自动生成的 health 时间戳，检查期间提交发生变化或构建标记不符就停止。

只有用户明确授权发布后才能使用 `bash deploy.sh --publish`；它才会执行 SSH 和 rsync。Worker 单独发布到 `raccord-ai`，必须单独配置密钥，不能使用班级站的 Worker 名称或路由。两站的限流 namespace 也不同，因为同账号下相同 namespace 会共享计数，见 [Cloudflare 官方说明](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)。

2026-09-27 只读核查服务器时，班级站静态目录存在，Raccord 的静态目录和 Nginx 站点尚未启用；默认站点会把未匹配的域名跳回班级站。仓库中的 Raccord 配置是待发布配置，不能据此声称 Raccord 已上线。新库建立、网页发布和 Worker 发布是不同步骤，分别核对实际结果。
