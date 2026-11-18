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

Asos: lokal `http://localhost:8787`, server `https://yetak-api.diyorjon.com` (web'da `VITE_API_URL`). Hammasi JSON. Xato bo'lsa: 4xx/5xx va `{ "xato": "sabab" }` — `xato` matnini tadbirkorga to'g'ridan-to'g'ri ko'rsatsa bo'ladi.

Xato kodlari (web shularni ajratadi):

- `400` — so'rov noto'g'ri (bo'sh xabar va h.k.). `404` — sessiya yoki qadam topilmadi (sessiya 30 kun ishlatilmasa o'chadi → yangisini oching). `409` — agent oldingi xabarga javob yozyapti. `413` — xabar 2000 belgidan uzun. `422` — rozilik natijadan oldin, yoki agent javob bera olmadi. `429` — juda tez yozilyapti.
- `503` — sun'iy intellekt band yoki sozlanmagan. `504` — agent uzoq o'ylab, javob kelmadi. Ikkala holatda tadbirkor xabari saqlanmaydi: qayta yuborsa bo'ladi.
- `GET /api/health` → `{ "ok": true, "agent": boolean }` — `agent: false` bo'lsa kalit qo'yilmagan.

Hukm, topilmalar, qadamlar, hisob — `natija` ichida, profil 12 maydonning hammasi to'lganda chiqadi. Qadam kalitlari: `royxat`, `faoliyat_muddati`, `foyda`, `summa`, `kredit_tarixi`, `mikrokredit`, `kafolat`, `eri`, `ariza`, `qayta_tekshirish`.

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
| POST | `/api/sessions/:id/mahsulot` | `{ "kalit": string }` | `SessiyaHolati` (papka boshqa bank mahsulotiga) |
| POST | `/api/sessions/:id/hujjatlar/:kalit` | multipart, `fayl` (JPG/PNG/WEBP/PDF, ≤10 MB) | `SessiyaHolati` (AI tekshiruvi bilan, 5–30 s) |
| POST | `/api/sessions/:id/hujjatlar/:kalit/ochirish` | — | `SessiyaHolati` |
| GET | `/api/sessions/:id/papka.pdf` | — | bitta PDF: muqova + ro'yxat + yuklangan hujjatlar |
| GET | `/api/bank/arizalar/:id/papka.pdf` | — | o'sha PDF, faqat rozilik bo'lsa |

Turlar: `shared/types.ts`.

## Hujjatlar papkasi

- Yagona manba: `docs/tadqiqot/hujjatlar.json` — har bank mahsulotiga kerakli hujjatlar (shartlari bilan) va har hujjatni qanday olish (`olish`: qayerda, qidiruv, qadamlar, vaqt, narx, manba). Mahsulot kartasi, papka, PDF va agent shu fayldan oladi (`server/src/hujjatlar.ts`).
- `SessiyaHolati.papka`: tanlangan mahsulot (bo'lmasa — eng mosi), hujjatlar ro'yxati (olib boriladigan / oldindan tekshiriladigan / bank o'zi oladigan), `tayyor/jami`, hujjatlar orasidagi ism nomuvofiqligi.
- Yuklangan fayl turini server baytlaridan aniqlaydi. Claude faqat o'qiydi: qanday hujjat, o'qiladimi, sanasi, egasining ismi, muammolar (`server/src/tekshiruv.ts`); «mos / muammo» hukmini kod chiqaradi. AI ishlamasa fayl baribir saqlanadi.
- Fayllar serverda `DATA_DIR/fayllar/<sessiya>/` da, sessiya bilan birga 30 kunda o'chadi. Log'ga hujjat matni yoki ism yozilmaydi.

Agent xabari (`Xabar`, `kim: "agent"`) qo'shimcha maydonlari:

- `bloklar` — chatdagi kartalar: `summa`, `pul_oqimi`, `garov`, `hukm`, `yol_xaritasi`, `atama`. Agent qaysisini ko'rsatishni tanlaydi (`korsatish` asbobi), raqamlarni server profil va `rules.ts` dan qo'yadi.
- `manbalar` — javob tayangan manbalar: `{ nom, url, parcha }`. Claude citations'dan olinadi.

## RAG (manbalar)

- Korpus: `docs/QOIDALAR.md` va `docs/tadqiqot/02_kob_moliya_kredit.md` dagi «1.2 Kredit olish» bo'limi. Ro'yxat: `server/scripts/korpus.mjs`.
- `yarn dev` / `build` / `test` oldidan korpus `server/src/korpus.generated.ts` ga yoziladi (serverga faqat `dist/index.js` boradi).
- Hujjatlar suhbat boshida `document` bloki bo'lib, citations yoqilgan va keshlanadi. Agent dastur va shartlar haqida faqat shulardan gapiradi.
- Korpusga faqat tekshirilgan manba qo'shiladi. Yangi hujjat: `korpus.mjs` dagi `HUJJATLAR` ga bir qator.

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
