#!/usr/bin/env sh
set -e

mkdir -p /app/logs

# 1) Replace placeholders in static assets
find /app \
  -path '/app/node_modules' -prune -o \
  -type f \( -name '*.js' -o -name '*.ts' \) \
  -exec sed -i "s|%BASE_URL%|${BASE_URL}|g" {} +

find /app -name 'okta.js' -type f -print0 | xargs -0 -r sed -i \
  -e "s|%OKTA_CLIENT_ID%|${OKTA_CLIENT_ID:-}|g" \
  -e "s|%OKTA_ISSUER%|${OKTA_ISSUER:-}|g" \
  -e "s|%OKTA_REDIRECT_URI%|${OKTA_REDIRECT_URI:-}|g"

# remove logs
rm -rf /app/logs/*.log
touch /app/logs/serve.log
# 4) Start 'serve' in foreground (container main process)
echo "[entrypoint] starting static server on ${PORT} ..."
exec serve -s /app -l "tcp://0.0.0.0:${PORT}" --no-clipboard --no-port-switching 2>&1 | tee -a /app/logs/serve.log