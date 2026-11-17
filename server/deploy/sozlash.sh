#!/bin/bash
# Bir martalik: kichik serverda Yetak API uchun joy tayyorlash. sudo bilan ishlaydi.
set -euo pipefail
cd /tmp/yetak-setup

id yetak >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin yetak
id yetak-deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash yetak-deploy

install -d -o yetak-deploy -g yetak-deploy -m 755 /opt/apps/yetak /opt/apps/yetak/releases /opt/apps/yetak/bin
install -d -o yetak -g yetak -m 750 /opt/apps/yetak/data
install -o root -g root -m 755 qabul.sh /opt/apps/yetak/bin/qabul

if [ ! -f /opt/apps/yetak/yetak.env ]; then
  printf 'CORS_ORIGIN=*\nCLAUDE_MODEL=claude-sonnet-5-5\n' > /opt/apps/yetak/yetak.env
fi
chown root:yetak /opt/apps/yetak/yetak.env
chmod 640 /opt/apps/yetak/yetak.env

# Birinchi versiya
install -o yetak-deploy -g yetak-deploy -m 644 index.js /opt/apps/yetak/releases/boshlang.js
[ -e /opt/apps/yetak/current.js ] || ln -s /opt/apps/yetak/releases/boshlang.js /opt/apps/yetak/current.js
chown -h yetak-deploy:yetak-deploy /opt/apps/yetak/current.js

# Deploy kaliti: faqat qabul skriptini ishga tushira oladi
install -d -o yetak-deploy -g yetak-deploy -m 700 /home/yetak-deploy/.ssh
printf 'command="/opt/apps/yetak/bin/qabul",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty %s\n' "$(cat yetak_deploy.pub)" > /home/yetak-deploy/.ssh/authorized_keys
chown yetak-deploy:yetak-deploy /home/yetak-deploy/.ssh/authorized_keys
chmod 600 /home/yetak-deploy/.ssh/authorized_keys

# Faqat bitta buyruqqa sudo
echo 'yetak-deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart yetak-api' > /etc/sudoers.d/yetak-deploy
chmod 440 /etc/sudoers.d/yetak-deploy
visudo -cf /etc/sudoers.d/yetak-deploy

install -o root -g root -m 644 yetak-api.service /etc/systemd/system/yetak-api.service
systemctl daemon-reload
systemctl enable --now yetak-api
systemctl restart yetak-api

install -o root -g root -m 644 nginx-yetak-api.conf /etc/nginx/sites-available/yetak-api
ln -sfn /etc/nginx/sites-available/yetak-api /etc/nginx/sites-enabled/yetak-api
nginx -t
systemctl reload nginx

sleep 2
curl -sf http://127.0.0.1:8787/api/health && echo " <- lokal OK"
