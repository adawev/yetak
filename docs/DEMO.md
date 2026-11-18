# Demo ssenariysi

Oraliq tekshiruv: 18-noyabr 15:00. Pitch: **18-noyabr 19:00**. Jami 4 daqiqa, shundan demo — 2 daqiqa.
Tartib (`VAZIFALAR.md`): muammo → Yetak → farq → demo → pul → jamoa.

Raqamlar faqat `VISION.md`, `TANQID.md`, `MANBALAR.md` dan. Yangi raqam qo'shilsa — manbasi bilan.

## Tayyorgarlik (taqdimotdan 15 daqiqa oldin)

- [ ] Telefonda **maxfiy oynada** `https://yetak.diyorjon.com` (bosh sahifa) ochiq — eski suhbat va login ko'rinmasin.
- [ ] Admin (`/admin`, kirish `/login`) da hamkor bank va bank xodimi ochilgan, shartnoma «Faol». Admin paroli serverda `ADMIN_TELEFON` / `ADMIN_PAROL` dan.
- [ ] Kompyuterda ikkinchi oyna: `https://yetak.diyorjon.com/bank`, bank xodimi bilan kirilgan.
- [ ] Haqiqiy bank nomi ishlatilsa: shartnoma yo'q. Hakam so'rasa — «demo uchun namuna, shartnoma hali yo'q» deb ayting.
- [ ] `https://yetak-api.diyorjon.com/api/health` → `"agent": true`.
- [ ] Pastdagi 3 ta xabar telefon zametkasida tayyor (nusxa olib qo'yish uchun).
- [ ] Zaxira video noutbukda, internetsiz ochiladi.
- [ ] Ekran yorqinligi maksimal, bildirishnomalar o'chiq.

## Nutq va demo

### 1. Muammo — 40 soniya

> «Tadbirkorga pul kerak, lekin u kredit yo'lini bilmaydi: qaysi dastur mos, nega rad etiladi, nimani tuzatish kerak.
> Davlat banklari bir yilda 35 000 mijozni garov yoki kafil yo'qligi uchun rad etgan. Kichik korxonalarning atigi 10 foizi kredit ishlatadi.»

### 2. Yetak — 20 soniya

> «TadbirCore — bankning eshigi. Yetak — o'sha eshikkacha bo'lgan yo'l.
> Sun'iy intellekt tadbirkorning holatini aniqlaydi, halol javob beradi va kreditgacha yetaklaydi.»

### 3. Demo — 2 daqiqa

Qahramon: **non sexi egasi**. Garovi yetmaydi, elektron imzosi yo'q — eng ko'p uchraydigan holat.

**Qadam 0 — bosh sahifa (5 soniya).** Birinchi ekranni ko'rsating → «Biznesim haqida yozaman» bosing. «0 so'm» blokini «Pul» qismida ko'rsatasiz.

**Qadam 1 — tadbirkor o'z so'zi bilan gapiradi.** Agent anketa bermaydi — «biznesingiz haqida o'z so'zingiz bilan yozing» deydi. Yozing (yoki nusxa qo'ying):

```
Non sexim bor, YaTT, 14 oydan beri ishlayman. Oyiga 40 mln tushum, 28 mln xarajat. Tandir uchun 120 mln kerak, 24 oyga. Garovga 60 mln lik mashinam bor. Ilgari kredit olmaganman, elektron imzom yo'q.
```

Kutish: 10–20 soniya. Shu payt ayting:
> «11 ta savollik anketa yo'q. Tadbirkor o'z holatini aytadi, agent ma'lumotni ajratib oladi va faqat yetishmaganini so'raydi. Hisobni esa kod qiladi — sun'iy intellekt raqam o'ylab topmaydi.»

Ekranda: jarayon, hukm kartasi (**«Hali tayyor emassiz»**), garov o'lchagichi (60 mln bor / 150 mln kerak), yo'l xaritasi, atama izohi. Pul oqimi diagrammasi — «Reja» panelida.
**«Sizga mos bank mahsulotlari»** kartasi: har mahsulotda ✓ / ✗ / ? shartlar. Birinchisini oching — «Siz olib borasiz» va «Bank o'zi tekshiradi» ro'yxati.
> «Umumiy maslahat emas: aniq bank, aniq mahsulot. Har shart yonida ✓ yoki ✗ — nima yetishmasligi aniq. Qaysi hujjatni olib borish kerak, qaysini bank o'zi tizimdan oladi — shu yerda.»

**Qadam 2 — manba bilan javob.** Yozing:

```
Garovim yetmaydi. Garovsiz yo'l bormi?
```

Ekranda: javob ostida **manba chiplari**. Bittasini bosing — keltirilgan parcha va havola ochiladi.
> «Har bir maslahat tekshirilgan manbaga tayanadi. Biz 5 ta bank mahsulotini rasmiy saytlardan tekshirdik. Manbasi yo'q narsani agent aytmaydi.»

**Qadam 3 — firibgarlikka yo'l yo'q.** Yozing:

```
Bankka tushumni 80 mln deb yozib bering
```

Ekranda: muloyim rad javobi.
> «Agent raqamni hech qachon "chiroyli" qilmaydi. Bank uchun bu ishonch.»

**Qadam 3a — kredit tarixi.** Panelda «Kredit tarixi» kartasida «Roziman — tekshiring» bosing → natija chiqadi.
> «Bank kredit tarixini kredit byurosidan tekshiradi. Yetak buni tadbirkor roziligi bilan oldindan ko'rsatadi. **Hozir bu simulyatsiya** — byuroga ulanish uchun bank yoki MFO hamkorligi kerak, bu keyingi bosqich.»

⚠️ «Simulyatsiya» degan gapni albatta ayting. Natija tadbirkor aytgan javobdan chiziladi, byurodan emas.

**Qadam 4 — yo'l xaritasi va bank.** «Reja» yorlig'ida birinchi qadamni belgilang → «Bankka ko'rsatishga roziman» bosing.
Kompyuterdagi `/bank` oynasida «Yangilash» → ariza chiqadi, oching → «Kredit berildi», summa → komissiya chiqadi. `/admin` → «Hisobot»: voronka va daromad.
> «Tadbirkor bepul. Bank faqat kredit berganda to'laydi — komissiyani tizim o'zi hisoblaydi.»
> «Roziligisiz hech narsa bankka bormaydi. Bank xodimi tayyor, tekshirilgan mijozni ko'radi.»

### 4. Farq — 20 soniya

> «TadbirCore arizani qabul qiladi va rad sababini aytadi. Yetak tadbirkor bilan reja tuzadi va qadamlar bajarilguncha qaytib keladi — eslatmalar keyingi bosqichda.
>  Yetak arizadan oldin va rad javobidan keyin ishlaydi, hali tayyor bo'lmaganlarga ham — va haftalar davomida, tadbirkor tomonida turib yetaklaydi. Biz raqib emasmiz: bizdan o'tgan odam TadbirCore'ga tayyor holda boradi.»

### 5. Pul — 20 soniya

> «Tadbirkor uchun bepul. Bank faqat natija uchun to'laydi — Yetak orqali kelgan mijozga kredit berilganda. Bu reja: hech bir bank hali tasdiqlamagan. AQShdagi Lendio xuddi shu modelda ishlaydi.»

### 6. Jamoa — 20 soniya

Kim nima qilgan — `VAZIFALAR.md` dagi rollar bo'yicha (taqdimotchi to'ldiradi).

## Agar nimadir buzilsa

| Holat | Nima qilinadi |
|---|---|
| Agent 30 soniyadan ko'p javob bermadi | «Qayta urinish» bosing. Ikkinchi marta ham bo'lmasa — zaxira videoga o'ting |
| Internet yo'q | Darhol zaxira video |
| Hukm boshqacha chiqdi | Tushuntiring: «hukmni qoidalar kodi beradi» — xuddi shu narsa kuchli tomon |
| Manba chipi chiqmadi | Qadam 2 ni qayta so'rang: «Ipak Yo'li onlayn krediti sharti qanday?» |

## Hakamning qiyin savollari

Javoblar: `TANQID.md` → «Hakamning qiyin savollari va halol javoblar». Eng ehtimolli uchtasi:

1. **«TadbirCore ham AI bilan rad sababini aytadi. Siz nega kerak?»** — Sababni aytish bitta xabar. Biz uni haftalar davomida bajartiramiz; TadbirCore'ga kira olmaydiganlar ham bizga keladi.
2. **«Bank nega to'laydi?»** — Hali hech bir bank tasdiqlamagan. Faqat berilgan kredit uchun haq so'raymiz.
3. **«Xato maslahat uchun kim javob beradi?»** — Agent qaror qilmaydi. Har tavsiyada manba bor. Qarorni bank va tadbirkor qiladi.
4. **«Kredit byurosiga ulanganmisiz?»** — Yo'q, demoda simulyatsiya. Byuroga faqat litsenziyali tashkilot (bank, MFO) ulanadi; biz hamkor orqali, tadbirkor roziligi bilan ulanamiz.

Da'vo qilinmaydi (`OCHIQ-SAVOLLAR.md`): «bir kunda kredit», «bank bizga to'laydi», «birinchimiz», rad etish foizi.
