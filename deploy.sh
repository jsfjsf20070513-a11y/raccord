#!/bin/bash
set -euo pipefail
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec node scripts/deploy.mjs
