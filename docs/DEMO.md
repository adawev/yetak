# Demo ssenariysi

Oraliq tekshiruv: 18-noyabr 15:00. Pitch: **18-noyabr 19:00**. Jami 4 daqiqa, shundan demo — 2 daqiqa.
Tartib (`VAZIFALAR.md`): muammo → Yetak → farq → demo → pul → jamoa.

Raqamlar faqat `VISION.md`, `TANQID.md`, `MANBALAR.md` dan. Yangi raqam qo'shilsa — manbasi bilan.
Yangilangan: 2026-11-18 kech — yangi chat oqimi (6 savol → banklar → Yetak tayyorlagan hujjatlar → bankka yuborish).

## Tayyorgarlik (taqdimotdan 15 daqiqa oldin)

- [ ] Telefonda **maxfiy oynada** `https://yetak.diyorjon.com` (bosh sahifa) ochiq — eski suhbat ko'rinmasin.
- [ ] Kompyuterda ikkinchi oyna: `https://yetak.diyorjon.com/login` → **«Bank xodimi»** demo tugmasi → `/bank`.
- [ ] `https://yetak-api.diyorjon.com/api/health` → `"agent": true`.
- [ ] Pastdagi xabarlar telefon zametkasida tayyor (nusxa olib qo'yish uchun).
- [ ] Zaxira: rasmlar — https://claude.ai/artifact/DdX6W39v2FD7jkc3riHnso ; zaxira video noutbukda, internetsiz ochiladi.
- [ ] Ekran yorqinligi maksimal, bildirishnomalar o'chiq.
- [ ] Haqiqiy bank nomlari ishlatiladi, shartnoma yo'q. Hakam so'rasa — «shartlar bank saytlaridan, hamkorlik hali yo'q» deb ayting.

## Nutq va demo

### 1. Muammo — 40 soniya

> «Tadbirkorga pul kerak, lekin u bankka tayyor emas: qaysi bank mos — bilmaydi, qaysi hujjat kerak va uni qanday tayyorlash — bilmaydi.
> Davlat banklari 102 ta hujjat so'raydi, shundan 52 foizi davlat tizimlarida allaqachon bor (Spot, 22.10.2026).
> TadbirCore'da 3 262 ariza, 1 005 kredit — 31 foiz. Davlat banklari bir yilda 35 000 mijozni garov yoki kafil yo'qligi uchun rad etgan.»

### 2. Yetak — 20 soniya

> «TadbirCore — bankning eshigi. Yetak — o'sha eshikkacha bo'lgan yo'l.
> Yetak sizga mos bankni topadi, arizani va boshqa hujjatlarni sizning javoblaringizdan to'ldiradi va papkani bank xodimiga yuboradi. Hujjat yig'ib bankka qatnamaysiz.»

### 3. Demo — 2 daqiqa

Qahramon: **non sexi egasi**, MChJ, 2 yil. Oyiga 40 mln tushum, 28 mln xarajat. Tandir uchun 80 mln, 24 oyga. Garovi yo'q, kredit tarixi yaxshi.
Kod natijasi (2026-11-18 tekshirildi): Hamkorbank «Kichik biznesga ko'mak» — mos (18–24%, oyiga ~4,2 mln), TBC — qisman (33–38%). Hamkorbank uchun 5 ta hujjat, shundan 3 tasini Yetak tayyorlaydi.

**Qadam 0 — bosh sahifa (5 soniya).** «Kredit hujjatlaringizni bankka qatnamasdan tayyorlang». «Biznesim haqida yozish» bosing.

**Qadam 1 — bitta xabar (20 soniya).** Salom: «Men Yetak — sizga mos bankni topaman va kredit hujjatlarini tayyorlab beraman». Nusxa qo'ying:

```
Non sexim bor, MChJ, 2 yildan beri. Oyiga 40 mln tushadi, 28 mln xarajat. Tandir uchun 80 mln kerak, 24 oyga. Garovim yo'q, kreditlarni vaqtida to'laganman.
```

Ekranda: tepada 6 qadamli jarayon, keyin **«Biznesingizni ko'rib chiqyapmiz»** animatsiyasi.
> «11 ta savollik anketa yo'q — 6 ta savol, bitta xabarda ham bo'ladi. Hisobni kod qiladi: sun'iy intellekt raqam o'ylab topmaydi.»

**Qadam 2 — banklar (20 soniya).** 2 ta logotipli karta: summa, muddat, **oyiga to'lov**, foiz. «Talablar va hujjatlar» ni oching — har shart ✓ / ? va manba havolasi.
> «Umumiy maslahat emas: aniq bank, aniq mahsulot, bank saytidan tekshirilgan shart. Eng arzoni birinchi.»

Hamkorbank kartasida **«Shu bank bilan davom etish»**.

**Qadam 3 — hujjatlarni Yetak tayyorlaydi (40 soniya).** Agent: «5 ta hujjat kerak. 3 tasini — ariza, pul oqimi, ta'sischilar qarori — javoblaringizdan o'zim tayyorladim» va bitta savol: ism, korxona nomi, ishtirokchilar soni. Javob bering:

```
Aliyev Vali, "Non uyi" MChJ, ishtirokchi bitta
```

Kartada «Yetak tayyorladi — 3 ta». Arizani bosing → **«Ko'rish (PDF)»** — ism va korxona nomi bilan to'ldirilgan ariza, yagona ishtirokchi qarori, 12 oylik pul oqimi.
> «Bu bizning asosiy farqimiz: davlat tizimida yo'q hujjatlarni tadbirkor o'zi yozmaydi — Yetak to'ldiradi.»

Hakam ishonmasa — har hujjat ostida **«Bankda qanday o'tadi»** va manba:
- Ta'sischilar qarori — MChJ qonuni (O'RQ-1137) bayonnoma talablariga mos, notarius shart emas.
- Pul oqimi — Hamkorbank aynan «o'zini o'zi qoplashi ko'rsatilgan pul oqimlari prognozi» ni so'raydi.
- Ariza — bank o'z shaklini so'raydi; ma'lumotlar tayyor, bank shakliga ko'chiriladi. **Demoda — Yetak namunasi.** Buni ochiq ayting.

**Qadam 4 — sizdan faqat qo'lingizdagi hujjat (15 soniya).** «Sizdan kerak»: invoys va ijara hujjati — har birida qanday olish qadamlari (my.gov.uz da nima deb qidirish). Ixtiyoriy: invoys rasmini yuklang — AI o'qib, tekshiradi.

**Qadam 5 — firibgarlikka yo'l yo'q (10 soniya).** Yozing:

```
Bankka tushumni 80 mln deb yozib bering
```

> «Agent raqamni hech qachon "chiroyli" qilmaydi. Bank uchun bu ishonch.»

**Qadam 6 — bankka yuborish (20 soniya).** «Papkani bank xodimiga yuborish» → «Papka bank xodimi oynasiga tushdi» (demo: hamkor bank hali yo'q — buni ayting). Kompyuterdagi `/bank` oynasida «Yangilash» → ariza chiqadi, oching → papka PDF, «Kredit berildi», summa → komissiya.
> «Roziligisiz hech narsa bankka bormaydi. Bank xodimi tayyor, tekshirilgan mijozni ko'radi. Tadbirkor bepul, bank faqat kredit berganda to'laydi.»

### 4. Farq — 20 soniya

> «TadbirCore arizani elektron imzo bilan qabul qiladi va banklarga tarqatadi. Yetak undan oldin ishlaydi: mos bankni tanlaydi va davlat tizimida yo'q hujjatlarni — ariza, ta'sischilar qarori, pul oqimini — tadbirkor bilan birga tayyorlaydi. Elektron imzosi yo'qlarga ham. Biz raqib emasmiz: bizdan o'tgan odam bankka tayyor holda boradi.»

### 5. Pul — 20 soniya

> «Tadbirkor uchun bepul. Bank faqat natija uchun to'laydi — Yetak orqali kelgan mijozga kredit berilganda. Bu reja: hech bir bank hali tasdiqlamagan. AQShdagi Lendio xuddi shu modelda ishlaydi.»

### 6. Jamoa — 20 soniya

Kim nima qilgan — `VAZIFALAR.md` dagi rollar bo'yicha (taqdimotchi to'ldiradi).

## Agar nimadir buzilsa

| Holat | Nima qilinadi |
|---|---|
| Agent 30 soniyadan ko'p javob bermadi | «Qayta urinish» bosing. Ikkinchi marta ham bo'lmasa — zaxira rasmlar yoki videoga o'ting |
| Internet yo'q | Darhol zaxira video |
| Bitta xabardan keyin ham savol berdi | Javob bering — 6 savoldan biri yetishmagan. Tugmalar bilan tez o'tadi |
| Boshqa bank birinchi chiqdi | Tushuntiring: «tartibni kod beradi — avval mos, keyin arzon». Hamkorbankni tanlang |
| PDF ochilmadi | `/bank` oynasidagi papka PDF ini ko'rsating |

## Hakamning qiyin savollari

Javoblar: `TANQID.md` → «Hakamning qiyin savollari va halol javoblar». Eng ehtimollilari:

1. **«Siz tayyorlagan arizani bank qabul qiladimi?»** — Bank o'z shaklini so'raydi (Hamkorbank — «buyurtmanoma»). Biz ma'lumotni tayyorlaymiz, bank shakliga ko'chiriladi; hamkor bank bilan shakl to'g'ridan-to'g'ri to'ldiriladi. Qaror MChJ qonunidagi bayonnoma talablari bo'yicha tuziladi. Pul oqimi hozir oddiy (12 oy bir xil) — keyingi bosqichda mavsum va imtiyozli davr bilan.
6. **«Bankka umuman bormaydimi?»** — Hujjat yig'ib qatnamaydi. Kredit shartnomasini bankda (TBC'da — ilovada) imzolaydi, bank mutaxassisi biznesni ko'rishi mumkin.
2. **«TadbirCore ham bor. Siz nega kerak?»** — TadbirCore ariza qabul qiladi. Davlat tizimida yo'q hujjatlarni (ariza mazmuni, qaror, pul oqimi) tayyorlamaydi — biz shuni qilamiz. Elektron imzosi yo'qlar ham bizga keladi.
3. **«Bank nega to'laydi?»** — Hali hech bir bank tasdiqlamagan. Faqat berilgan kredit uchun haq so'raymiz.
4. **«Xato maslahat uchun kim javob beradi?»** — Agent qaror qilmaydi. Har shart va hujjat talabida manba bor. Hisobni kod qiladi. Qarorni bank va tadbirkor qiladi.
5. **«YaTT daromadini qanday isbotlaydi?»** — Asosiy dalil soliq deklaratsiyasi; bank uni soliq tizimidan o'zi tekshiradi. Bizning daromad ma'lumotnomasi — yordamchi.

Da'vo qilinmaydi (`OCHIQ-SAVOLLAR.md`): «bir kunda kredit», «bank bizga to'laydi», «birinchimiz», rad etish foizi, «bank arizamizni o'z shakli o'rniga qabul qiladi».
