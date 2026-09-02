# Raccord 上线 runbook — raccord.rucmathclass.com

> 背景(2026-08-06):math 线切分为 Raccord / 班级网站 两线。旧站 `rucmathclass.com`
> 与其线上构建**永久归班级网站线,全程不动**;Raccord 上子域名成为独立新站。
> Cloudflare DNS 已加 `raccord` A 记录 → 149.28.69.75(橙云,HTTPS 在边缘终止)。
>
> **授权闸**:以下每个生产动作都须作者原文点名(同 mathclass-deploy 第 0 闸),
> 概括性"上线吧/发个版"不算。

## 0. 前提

- 本分支(域名改造 + Worker 路由 + 本 runbook)已合并 main,从 main 发布。
- 本地预检三连绿:`npm ci && npm run lint && npm test`,`npm run build` 通过。

## 1. Worker 路由(Cloudflare 边缘)

```bash
cd worker && npx wrangler deploy
```

- `wrangler.toml` 已含 `raccord.rucmathclass.com` 的 `/api/chat`、`/api/speak*` 两条路由;
  与旧域名路由同一个 Worker、同一套 secret(GEMINI/ELEVENLABS),**不需重设 secret**。
- 需要 wrangler 已登录该 Cloudflare 账号(`npx wrangler whoami` 自查)。

## 2. nginx(VPS 149.28.69.75)

```bash
scp deployment/nginx/raccord-security-headers.conf <user>@149.28.69.75:/etc/nginx/snippets/
scp deployment/nginx/raccord.conf <user>@149.28.69.75:/etc/nginx/sites-available/
ssh <user>@149.28.69.75 'ln -sf /etc/nginx/sites-available/raccord.conf /etc/nginx/sites-enabled/raccord.conf && nginx -t && systemctl reload nginx'
```

- `nginx -t` 不过就停,别 reload。reload 平滑,不影响旧站与青协。

## 3. 构建 + 部署(本地,发布源只能是 public 仓的 main)

```bash
MATHCLASS_DEPLOY_DIR=/var/www/raccord/dist \
MATHCLASS_DEPLOY_HOST=149.28.69.75 \
MATHCLASS_DEPLOY_USER=<user> \
MATHCLASS_DEPLOY_SSH_KEY=<key路径> \
./deploy.sh
```

- 照片注入链路已于 2026-09-02 从 deploy.sh 删除,`MATHCLASS_PRIVATE_REPO` 不再被读取;真实班级照片永不随 Raccord。
  (占位图构建)。班级照片只属于旧站——这与"站面不出现班级信息"的拍板一致。
- `MATHCLASS_DEPLOY_DIR` 必须是 `/var/www/raccord/dist`。**漏设会写进旧站目录、
  把班级站覆盖成 Raccord——这是本 runbook 的头号事故位。**

## 4. 验证(两站都要查)

```bash
# 新站活了:buildTime 应是"刚刚"
curl -fsS https://raccord.rucmathclass.com/health.json
curl -fsS -o /dev/null -w "%{http_code}\n" https://raccord.rucmathclass.com/
# 旧站没被动过:buildTime 应仍是 2026-06-24
curl -fsS https://rucmathclass.com/health.json
```

- `/api` 通不通:打开 `https://raccord.rucmathclass.com/assistant` 发一条消息
  (请求体结构以 `worker/src/index.js` 为准,别用猜的 curl 体)。
- 肉眼确认新站**没有**真实班级照片(应为占位图/无照片)。

## 5. Supabase(工具页登录/找回密码)

Dashboard → Authentication → URL Configuration → Additional Redirect URLs 添加:

```
https://raccord.rucmathclass.com/reset-password
```

- REST / realtime 不按 Origin 拦,anon key + RLS 照常,无其他改动。

## 回滚

新站出问题:`rm /etc/nginx/sites-enabled/raccord.conf && nginx -t && systemctl reload nginx`
即回到"子域名 301 到旧站"的状态;旧站从头到尾不受影响。
