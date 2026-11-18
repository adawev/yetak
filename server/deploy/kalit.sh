#!/bin/bash
# Claude kalitini serverga qo'yadi va agentni sinaydi.
# Kalit ekranda ko'rinmaydi, buyruq qatoriga va log'ga tushmaydi.
# Ishlatish: server/deploy/kalit.sh   (ssh kichik ishlashi kerak)
set -euo pipefail
API="https://yetak-api.diyorjon.com/api"

if [ ! -t 0 ]; then
  echo "Bu skript kalitni yashirin so'raydi: oddiy terminalda ishga tushiring (Claude Code'dagi ! bilan emas)."; exit 1
fi
read -rsp "Claude kaliti (sk-ant-...): " KALIT; echo
case "$KALIT" in sk-ant-*) ;; *) echo "Bu Claude kalitiga o'xshamaydi (sk-ant- bilan boshlanadi)."; exit 1;; esac

# Kalit stdin orqali boradi; serverda eski qator almashtiriladi, fayl root:yetak 640.
printf '%s\n' "$KALIT" | ssh kichik 'set -e
read -r K
F=/opt/apps/yetak/yetak.env
T=$(sudo mktemp)
sudo sh -c "grep -v ^ANTHROPIC_API_KEY= $F > $T || true"
printf "ANTHROPIC_API_KEY=%s\n" "$K" | sudo tee -a "$T" >/dev/null
sudo install -o root -g yetak -m 640 "$T" "$F"
sudo rm -f "$T"
sudo systemctl restart yetak-api'
unset KALIT

echo "Server qayta ishga tushdi. Tekshiryapman..."
sleep 3
curl -sf "$API/health"; echo

ID=$(curl -sf -X POST "$API/sessions" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
KOD=$(curl -s -o /tmp/yetak-sinov.json -w '%{http_code}' -X POST "$API/sessions/$ID/messages" \
  -H 'content-type: application/json' -d '{"matn":"Salom, tikuvchilik sexim bor"}')
if [ "$KOD" = 200 ]; then
  echo "Tayyor: agent Claude bilan javob berdi."
else
  echo "Agent javob bermadi ($KOD):"; cat /tmp/yetak-sinov.json; echo
fi
rm -f /tmp/yetak-sinov.json
