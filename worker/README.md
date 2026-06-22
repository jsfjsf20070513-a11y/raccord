# 班级 AI 助手 · Cloudflare Worker 代理

持有 Gemini API key 的极薄后端(option A)。浏览器永远拿不到 key;前端只 POST 到
`/api/chat`,Worker 调 Gemini 返回文本。

## 接口

```
POST https://rucmathclass.com/api/chat
Content-Type: application/json

{ "messages": [ { "role": "user", "content": "什么是中值定理?" } ] }
→ 200 { "text": "…" }
```

`role` 取 `user` | `model`(或 `assistant`,会归一为 `model`)。最多取最近 20 条,
每条最多 4000 字符。

## 部署(需要 Cloudflare 账号)

```bash
cd worker
npm i -g wrangler            # 或用 npx wrangler

# 1) 登录(交互)或用 token:export CLOUDFLARE_API_TOKEN=<Edit Workers token>
wrangler login

# 2) 注入 key —— 这是 secret,不进代码/不进 git。粘贴 Gemini 的 AQ.xxx 那串
wrangler secret put GEMINI_API_KEY

# 3) 部署
wrangler deploy

# 4) 绑路由:把 rucmathclass.com/api/chat 指向本 Worker
#    取消 wrangler.toml 里 [[routes]] 注释后重新 deploy,
#    或在 Cloudflare 控制台 Workers → Routes 手动添加。
```

部署后用 curl 自测:

```bash
curl -s https://rucmathclass.com/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"bonjour, explique la dérivée en un mot"}]}'
```

## 安全要点

- key 只存在 Wrangler secret 里,代码与前端产物都不含它。
- CORS 仅放行 `rucmathclass.com`(及 localhost 调试)。
- 无状态:不存对话、不接数据库。
- 模型 `gemini-flash-latest`(免费层友好);改模型只动 `MODEL` 常量。
