# Yetak server

Node + TypeScript (Hono). API shakli: `docs/ARXITEKTURA.md`. Turlar: `shared/types.ts`.

## Ishga tushirish

```
cd server
yarn install
ANTHROPIC_API_KEY=... yarn dev     # http://localhost:8787
yarn test                          # qoidalar va API sinovlari (Claude chaqirilmaydi)
```

Kalitsiz ham ishlaydi: sessiya, qadam, rozilik, bank oynasi ishlaydi; xabar yuborish 503 va sababini qaytaradi.

## Fayllar

- `src/rules.ts` — yagona qoidalar joyi: hukm, topilmalar, yo'l xaritasi, hisob. Har qoidada manba.
- `src/agent.ts` — Claude (Sonnet). Gaplashadi, profilni to'ldiradi, natijani tushuntiradi. Hisoblamaydi.
- `src/app.ts` — API yo'llari, xato matnlari.
- `src/store.ts` — saqlash: `data/sessions.json`. 30 kun ishlatilmagan sessiya o'chadi.
- `src/namunalar.ts` — demo uchun 3 xil tadbirkor (tayyor, hali emas, olmang).

## Sozlamalar (muhit o'zgaruvchilari)

| Nom | Standart | Nima |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Claude kaliti |
| `CLAUDE_MODEL` | `claude-sonnet-5-5` | Suhbat modeli |
| `PORT` / `HOST` | `8787` / `127.0.0.1` | |
| `DATA_DIR` | `./data` | Sessiyalar fayli |
| `CORS_ORIGIN` | `*` | Vergul bilan ruxsat etilgan manzillar |
| `SAQLASH_KUN` | `30` | Necha kundan keyin eski sessiya o'chadi |

## Joylash

Qo'lda, sardor kompyuteridan: `server/deploy/joylash.sh` — sinov, yig'ish, «kichik» serverga yuborish. Yangi versiya 20 soniyada javob bermasa, avvalgisiga o'zi qaytadi. GitHub Actions faqat sinovni ishlatadi.

Server tomoni (`deploy/`): `sozlash.sh` — bir martalik o'rnatish; `qabul.sh` — yangi versiyani qabul qiladi (deploy kaliti faqat shu skriptni ishga tushira oladi); `yetak-api.service` — xizmat, xotira chegarasi 300 MB. HTTPS sertifikatini certbot o'zi qo'shgan va yangilaydi.

Claude kaliti serverda: `/opt/apps/yetak/yetak.env` (`ANTHROPIC_API_KEY=...`), keyin `sudo systemctl restart yetak-api`.

Manzil: `https://yetak-api.63-177-216-224.sslip.io` (domen tanlangach almashtiriladi).
