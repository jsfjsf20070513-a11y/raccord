# 发布 Raccord

这里只发布静态文件，不包含数据库、账号服务或 Worker。2026-11-04 的合并与整理没有发布网站，也没有删除或迁移云端数据。实际服务器和域名状态须在发布前核对。

## 准备

先取得用户明确的发布授权。确认本仓 `main` 已同步、工作区没有未保存文件，再运行 `npm ci`。删除分支和合并代码的授权不包含发布。

服务器需要为作品配置独立的域名和目录。[Nginx 模板](nginx/raccord.conf.example) 安装前必须替换示例域名，并由实际托管环境提供 HTTPS。不要安装其他项目的配置。SSH 主机指纹须事先核对并加入 `known_hosts`；脚本不会自动接受新指纹。

在终端设置以下变量；密钥内容不能写进仓库：

```bash
export RACCORD_SITE_URL=https://作品域名
export RACCORD_DEPLOY_HOST=服务器地址
export RACCORD_DEPLOY_USER=发布用户
export RACCORD_DEPLOY_SSH_KEY=/密钥的绝对路径
```

目标目录固定为 `/var/www/raccord/dist`，无需配置。若设置 `RACCORD_DEPLOY_DIR`，也只能是这个值。脚本不读取其他项目的部署变量。

## 先检查，再发布

```bash
bash deploy.sh --check
```

不写参数也只做检查。脚本先核对仓库、main 分支、工作区和配置，再运行代码检查、测试和构建；结束时再次核对分支与提交。它还会核对构建中的应用名、提交号、域名、时间和入口文件。任何一步失败都会停止。检查模式不连接服务器。

用户已明确授权本次发布、检查也通过后，才运行：

```bash
bash deploy.sh --publish
```

发布会重新执行全部检查，再通过 SSH 和 rsync 同步文件。同步使用 `--delete`，因此 `/var/www/raccord/dist` 必须只存本站的构建产物，不能存用户文件或其他服务的数据。不要用其他目录试跑。

## 验证与回退

发布前保存当前站点的构建产物及 `health.json`，作为回退副本。

发布后访问作品域名的 `/health.json`，并检查使用正确 Host 的源站响应。确认 `app` 为 `Raccord`，`revision`、`siteOrigin` 和 `buildTime` 与本次 `dist/health.json` 一致。直接访问服务器 IP 可能进入默认站点，不能代替这一步。

再打开入口，走完 PLAN → Carnet → Limite → PLAN，检查手机页面、返回入口和刷新后的记录。纯静态作品没有账号或 API 需要验证。

需要回退时，把发布前保存的本站构建重新同步到同一目录，再核对 `health.json` 和页面。不要通过改动其他站点来回退。
