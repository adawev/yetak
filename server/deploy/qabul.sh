#!/bin/bash
# GitHub Actions'dan keladigan yangi versiyani qabul qiladi.
# yetak-deploy foydalanuvchisining SSH kaliti faqat shu skriptni ishga tushira oladi (authorized_keys: command=...).
# Ishlatish: cat index.js | ssh yetak-deploy@server <commit-sha>
set -euo pipefail

SHA="${SSH_ORIGINAL_COMMAND:-}"
if ! [[ "$SHA" =~ ^[0-9a-f]{7,40}$ ]]; then
  echo "noto'g'ri versiya: $SHA" >&2
  exit 2
fi

ILDIZ=/opt/apps/yetak
YANGI="$ILDIZ/releases/$SHA.js"
ESKI="$(readlink -f "$ILDIZ/current.js" || true)"

head -c 20000000 > "$YANGI.tmp"
[ -s "$YANGI.tmp" ] || { echo "bo'sh fayl keldi" >&2; rm -f "$YANGI.tmp"; exit 3; }
mv "$YANGI.tmp" "$YANGI"
ln -sfn "$YANGI" "$ILDIZ/current.js.new" && mv -Tf "$ILDIZ/current.js.new" "$ILDIZ/current.js"

sudo /usr/bin/systemctl restart yetak-api

for _ in $(seq 1 20); do
  sleep 1
  if curl -sf -m 2 http://127.0.0.1:8787/api/health > /dev/null; then
    echo "ishga tushdi: $SHA"
    # Oxirgi 5 versiya qoladi
    ls -1t "$ILDIZ"/releases/*.js | tail -n +6 | xargs -r rm -f
    exit 0
  fi
done

echo "yangi versiya ishlamadi, eskisiga qaytaramiz" >&2
if [ -n "$ESKI" ] && [ -f "$ESKI" ]; then
  ln -sfn "$ESKI" "$ILDIZ/current.js.new" && mv -Tf "$ILDIZ/current.js.new" "$ILDIZ/current.js"
  sudo /usr/bin/systemctl restart yetak-api
fi
exit 1
