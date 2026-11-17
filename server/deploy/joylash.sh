#!/bin/bash
# Qo'lda joylash: sinov → yig'ish → serverga.
# Serverga xuddi Actions kabi yetak-deploy kaliti bilan yuboriladi; server tomoni deploy/qabul.sh.
# Ishlatish: server/deploy/joylash.sh [deploy-kalit-fayli, standart ~/.ssh/yetak_deploy]
set -euo pipefail
KALIT="${1:-$HOME/.ssh/yetak_deploy}"
cd "$(dirname "$0")/.."
yarn -s test
yarn -s build
SHA="$(git rev-parse HEAD)"
ssh -i "$KALIT" -o BatchMode=yes yetak-deploy@63.177.216.224 "$SHA" < dist/index.js
curl -sf -m 10 https://yetak-api.diyorjon.com/api/health && echo
