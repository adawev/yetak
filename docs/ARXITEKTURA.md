# Arxitektura

Qarorlar (2026-11-17): React + TypeScript old va orqa tomonda, Claude (suhbat uchun Sonnet), old tomon Netlify, orqa tomon «kichik» serverda. Paket menejeri: yarn.

## Papkalar

```
shared/types.ts   — server va web uchun yagona turlar
server/           — Node + TypeScript (Hono). Agent, qoidalar, saqlash.
web/              — Vite + React + TypeScript + Tailwind (shadcn/ui uslubi)
docs/             — hujjatlar
assets/           — belgi
```

## Kim nima qiladi

- **Qoidalar (`server/src/rules.ts`)** — yagona joy. Hukm, topilmalar, yo'l xaritasi va barcha hisoblar shu yerda, oddiy kodda. Har qoidada manba bor.
- **Agent (`server/src/agent.ts`)** — Claude. Gaplashadi, profilni to'ldiradi, natijani tushuntiradi. Hech narsa hisoblamaydi.
- **Web** — faqat ko'rsatadi. Hech qanday qoida yoki hisob web'da yo'q.

## API

Asos: `http://localhost:8787` (web'da `VITE_API_URL`). Hammasi JSON. Xato bo'lsa: 4xx/5xx va `{ "xato": "sabab" }`.

| Usul | Yo'l | So'rov | Javob |
|---|---|---|---|
| POST | `/api/sessions` | — | `SessiyaHolati` (agentning birinchi salomi bilan) |
| GET | `/api/sessions/:id` | — | `SessiyaHolati` |
| POST | `/api/sessions/:id/messages` | `{ "matn": string }` | `SessiyaHolati` |
| POST | `/api/sessions/:id/qadamlar/:kalit` | `{ "bajarildi": boolean }` | `SessiyaHolati` |
| POST | `/api/sessions/:id/rozilik` | `{ "rozi": boolean }` | `SessiyaHolati` |
| GET | `/api/bank/arizalar` | — | `BankArizasi[]` (faqat rozilik bergan va natijasi borlar) |
| GET | `/api/bank/arizalar/:id` | — | `BankArizasi` |
| GET | `/api/health` | — | `{ "ok": true }` |

Turlar: `shared/types.ts`.

Xabar yuborish 5–20 soniya olishi mumkin (agent o'ylaydi). Web kutish holatini ko'rsatadi.

## Web sahifalari

- `/` — tadbirkor chati. Chapda suhbat, o'ngda (telefonda pastda) holat: jarayon, hukm, yo'l xaritasi.
- `/bank` — bank oynasi: arizalar ro'yxati va bitta arizaning to'liq ko'rinishi.

Sessiya `id` brauzerda saqlanadi (localStorage), sahifa yangilansa suhbat tiklanadi.

## Demo cheklovlari (taqdimotda halol aytiladi)

- Kirish (login) yo'q. Bank oynasi ochiq.
- Ma'lumot serverda oddiy faylda saqlanadi.
- Qoidalar ochiq manbalardan olingan, bank bilan tasdiqlanmagan. Har birida manba ko'rsatiladi.
- Stavka taxminiy, hisob yo'l-yo'riq uchun.
