# 发布 Raccord

这里发布的是静态文件，不包含数据库、账号服务或 Worker。当前仓库不能证明服务器或域名已经配置好。

## 准备

先取得用户明确的发布授权。检查待发布分支和提交，确认工作区干净，再运行 `npm ci`。

服务器需要为作品配置独立的域名和目录。`nginx/raccord.conf.example` 是模板，安装前替换示例域名，并由实际托管环境提供 HTTPS。不要安装其他项目的配置。SSH 主机指纹须事先核对并加入 known_hosts；脚本不会自动接受新指纹。

发布脚本只接受以下变量，不读取其他项目的配置：

```bash
export RACCORD_SITE_URL=https://作品域名
export RACCORD_DEPLOY_HOST=服务器地址
export RACCORD_DEPLOY_USER=发布用户
export RACCORD_DEPLOY_SSH_KEY=/密钥的绝对路径
export RACCORD_DEPLOY_DIR=/var/www/raccord/dist
./deploy.sh
```

目标目录固定为 `/var/www/raccord/dist`。漏配、错误目录、无效主机或密钥会在联网前被拒绝。脚本从自身目录运行检查和构建，确认产物属于 Raccord 后才同步 `dist/`。同步使用 `rsync --delete`，因此这个目录必须只存本站的构建产物，不能存用户文件或其他服务的数据。

## 验证与回退

发布前保存当前站点的构建产物及 `health.json`，用于回退。发布后访问作品域名的 `/health.json`，确认 `app` 为 `raccord`，`buildTime` 与本次 `dist/health.json` 一致。不要拿其他域名或裸 IP 的默认站点作比较。

再打开入口，走完 PLAN → Carnet → Limite → PLAN，并检查手机页面。没有账号或 API 可供验证。

需要回退时，把发布前保存的本站构建重新同步到同一目录，再核对 health。不要删除或改动其他站点来代替回退。
