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
# Optional: path to a sibling private repo that holds the real plate
# photos and album metadata. When set, scripts/prepare-private-assets.mjs
# pulls the real albums into this build; otherwise the public-safe
# placeholder data ships untouched.
PRIVATE_REPO="${MATHCLASS_PRIVATE_REPO:-}"

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

# Always clean up any private assets at exit, whether the build succeeds
# or fails, so the working tree never accidentally retains real photos.
cleanup() {
  node scripts/cleanup-private-assets.mjs >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "🔐 [1/4] 准备隐私资源..."
if [ -n "${PRIVATE_REPO}" ]; then
  MATHCLASS_PRIVATE_REPO="${PRIVATE_REPO}" node scripts/prepare-private-assets.mjs
else
  echo "[prepare] MATHCLASS_PRIVATE_REPO not set — using public-safe placeholders."
fi

echo "🚀 [2/4] 开始构建静态文件..."
npm run build

echo "📦 [3/4] 正在服务器上准备目标目录..."
ssh "${SSH_OPTS[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${REMOTE_DIR}'"

echo "📤 [4/4] 开始同步静态文件..."
rsync -av --delete \
  -e "ssh -i '${SSH_KEY}' -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
  dist/ "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_DIR}/"

echo "✅ 部署完成！远端目录已更新为 ${REMOTE_DIR}"
