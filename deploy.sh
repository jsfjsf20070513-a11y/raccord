#!/bin/bash

set -euo pipefail

# ==========================================
# 班级网站自动化部署脚本
# Class website deploy script
# ==========================================

DEPLOY_HOST="${MATHCLASS_DEPLOY_HOST:-}"
DEPLOY_USER="${MATHCLASS_DEPLOY_USER:-}"
REMOTE_DIR="${MATHCLASS_DEPLOY_DIR:-/var/www/MathClassWebsite/dist}"
SSH_KEY="${MATHCLASS_DEPLOY_SSH_KEY:-}"
SSH_OPTS=(
  -i "${SSH_KEY}"
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=accept-new
)

if [ -z "${DEPLOY_HOST}" ] || [ -z "${DEPLOY_USER}" ] || [ -z "${SSH_KEY}" ]; then
  echo "❌ 请先设置 MATHCLASS_DEPLOY_HOST、MATHCLASS_DEPLOY_USER 和 MATHCLASS_DEPLOY_SSH_KEY。"
  exit 1
fi

if [ ! -f "${SSH_KEY}" ]; then
  echo "❌ 未找到部署密钥: ${SSH_KEY}"
  exit 1
fi

echo "🚀 [1/3] 开始构建静态文件..."
npm run build

echo "📦 [2/3] 正在服务器上准备目标目录..."
ssh "${SSH_OPTS[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${REMOTE_DIR}'"

echo "📤 [3/3] 开始同步静态文件..."
rsync -av --delete \
  -e "ssh -i '${SSH_KEY}' -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
  dist/ "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_DIR}/"

echo "✅ 部署完成！远端目录已更新为 ${REMOTE_DIR}"
