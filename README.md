<p align="center"><img src="assets/yetak-mark.svg" width="72" alt="Yetak"></p>

<h1 align="center">Yetak</h1>

<p align="center"><b>Tadbirkorni bankka tayyor mijoz qilib olib boradigan AI agent.</b><br>
TadbirCore — bankning eshigi. Yetak — o'sha eshikkacha bo'lgan yo'l.</p>

<p align="center">
  <a href="https://yetak.diyorjon.com"><b>▶ Ilovani ochish — yetak.diyorjon.com</b></a> ·
  <a href="docs/Yetak-pitch-dek.pdf"><b>📄 Pitch dek (PDF)</b></a>
</p>

Umummilliy AI Xakaton, Toshkent, 17–19-noyabr 2026 · Tadbirkorlik yo'nalishi, 20-muammo (kichik biznes krediti).

## Muammo

- Tadbirkorga pul kerak, lekin qaysi bank va qaysi kredit unga mosligini bilmaydi.
- Qaysi hujjat kerak, uni qayerdan olish — bilmaydi. Davlat banklari 102 ta hujjat so'raydi, ularning 52% i davlat tizimlarida allaqachon bor.
- Natija: ariza ko'p, kredit kam. TadbirCore'da 3 262 ariza → 1 005 kredit (31%). Davlat banklari bir yilda 35 000 mijozni garov yoki kafil yo'qligi uchun rad etgan.

Manbalar: [docs/MANBALAR.md](docs/MANBALAR.md)

## Yetak nima qiladi

1. **Suhbat orqali holatni aniqlaydi** — anketa yo'q, tadbirkor o'z so'zi bilan yozadi (lotin, kirill, rus).
2. **Mos 2–3 bankni topadi** — summa, foiz, muddat, oylik to'lov; har shart yonida ✓ / ✗.
3. **Halol javob beradi** — «tayyorsiz», «mana buni tuzating» yoki «hozir ariza bermang». Hech qachon «kredit olasiz» demaydi.
4. **Hujjatlarni birga tayyorlaydi** — har hujjatni qayerdan va qanday olish; tadbirkor rasmga olib yuklaydi, AI tekshiradi. Ariza, pul oqimi, ta'sischilar qarori qoralamalarini o'zi to'ldiradi.
5. **Saytda adashsa yo'l ko'rsatadi** — skrinshot yuboradi, agent qaysi tugmani bosishni aytadi.
6. **Bitta papka beradi** — hamma hujjat bitta PDF. Tadbirkor roziligi bilan bank oynasida ko'rinadi.

Tekshirilgan banklar: Kapitalbank, SQB, Hamkorbank, Mikrokreditbank, Ipak Yo'li, TBC Bank.

## Sinab ko'rish

| Kim | Qayerda | Kirish |
|---|---|---|
| Tadbirkor | [yetak.diyorjon.com](https://yetak.diyorjon.com) | kerak emas |
| Bank xodimi | [yetak.diyorjon.com/login](https://yetak.diyorjon.com/login) | «Bank xodimi» demo tugmasi |
| Admin | [yetak.diyorjon.com/login](https://yetak.diyorjon.com/login) | «Admin» demo tugmasi |

Namuna xabar: *«Non sexim bor, YaTT, 14 oydan beri ishlayman. Oyiga 40 mln tushum, 28 mln xarajat. Tandir uchun 120 mln kerak, 24 oyga. Garovga 60 mln lik mashinam bor.»*

## TadbirCore'dan farqi

| | TadbirCore | Yetak |
|---|---|---|
| Qachon | Ariza paytida | Arizadan oldin |
| Kimga | Tayyor, e-imzosi bor tadbirkor | Hali tayyor bo'lmaganlarga ham |
| Qanday | Forma | Oddiy suhbat, skrinshot bilan yordam |
| Kim tomonida | Bank va davlat | Tadbirkor |

Raqib emasmiz: Yetakdan o'tgan odam TadbirCore'ga tayyor holda boradi.

## Pul (reja)

- Tadbirkor uchun yo'l ko'rsatish — **bepul**.
- Hujjatlarni biz tayyorlaymiz — 10–20 ming so'm.
- Ishonchnoma bilan to'liq yig'ish — tadbirkor notarial ishonchnoma beradi, hujjatlarni uning nomidan biz olamiz (narx pilotda).
- Bank faqat kredit berilganda tayyor mijoz uchun haq to'laydi (modelda 1%). Hali hech bir bank tasdiqlamagan.

Unit-ekonomika (faraz, pilotda o'lchanadi): LLM xarajati 1 xabar ≈ 360 so'm (o'lchangan), CAC 36 000, LTV ≈ 116 000, LTV/CAC ≈ 3,2. Hisob va manbalar: [docs/PITCH-RAQAMLAR.md](docs/PITCH-RAQAMLAR.md)

## Ishonch qoidalari

- **Hisobni kod qiladi, AI emas** — hukm, bank tanlash va raqamlar oddiy kodda; AI faqat gaplashadi va hujjat o'qiydi.
- **Manbasiz gap yo'q** — har bank sharti rasmiy saytdan, havolasi bilan.
- **Roziliksiz bankka hech narsa bormaydi.** Log'larga shaxsiy ma'lumot yozilmaydi.
- **Firibgarlikka yo'q** — «tushumni ko'proq yozib bering» degan so'rov rad etiladi.

## Texnik

- **Web:** React + TypeScript + Vite + Tailwind → Netlify
- **Server:** Node + TypeScript (Hono), Claude API → AWS
- Tuzilma: `web/` — ekranlar · `server/` — agent, qoidalar, PDF · `shared/` — umumiy turlar · `docs/` — hujjatlar va tadqiqot

Batafsil: [Arxitektura](docs/ARXITEKTURA.md) · [Vision](docs/VISION.md) · [Raqobat](docs/RAQOBAT.md) · [Bank tadqiqoti](docs/tadqiqot/kredit_turlari_banklar.md)

## Jamoa

| | Rol |
|---|---|
| [adawev](https://github.com/adawev) | Sardor, server va agent |
| [muhammadnuruz](https://github.com/muhammadnuruz) | Web |
| [AlibekIsayev](https://github.com/AlibekIsayev) | Tadqiqot: banklar va hujjatlar |
| [Ilyos056](https://github.com/Ilyos056) | Dalil va xavflar |
| [shoxjahon20007-gif](https://github.com/shoxjahon20007-gif) | Taqdimot |
