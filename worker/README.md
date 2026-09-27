# Raccord Worker

本目录只属于 Raccord。`wrangler.toml` 的目标是 `raccord-ai`，路由只有 `raccord.rucmathclass.com/api/chat` 与 `/api/speak*`。它不接管班级站，不共用班级站的生产密钥；限流 namespace 为 `1002`。

聊天把前端传入的文字或图片发送给 Gemini，语音请求返回 WAV。代码不保存对话，历史记录由前端写入 Raccord 的独立数据库。浏览器允许的来源是 Raccord 域名和本地开发地址，语音缓存地址也属于 Raccord。

本地使用 `npm run worker:dev`，前端开发代理只连接本地 8787 端口。把 `GEMINI_API_KEY` 放进未跟踪的 `worker/.dev.vars`。`npm run worker:check` 只验证构建，不会发布或配置生产密钥。

当前实现没有校验 Supabase 登录，限流故障仍会放行；前端登录不能代替接口鉴权。模型名称和额度也需要在独立上线时验证，不能把打包成功视为服务可用。此轮只完成目标隔离，没有发布这个 Worker。

发布必须取得用户明确授权，再按 [发布说明](../deployment/RACCORD_DEPLOY.md) 核对独立目标、密钥和接口。不要使用班级站仓库或它的 Worker 发布命令。
