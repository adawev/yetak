# Yetak — vision

**Bir gapda:** Yetak tadbirkorni bankka **tayyor mijoz** qilib olib boradi: unga mos 1–2 bankni topadi, hujjatlarini birga yig'adi va bitta papka qilib beradi.

Shior: TadbirCore — bankning eshigi. Yetak — o'sha eshikkacha bo'lgan yo'l.

## Muammo

Tadbirkorga pul kerak, lekin u bankka tayyor emas.

- Qaysi bank va qaysi kredit unga mos — bilmaydi.
- Qaysi hujjat kerak, uni qayerdan va qanday olish — bilmaydi. Davlat banklari 102 ta hujjat so'raydi, shundan 52% i davlat tizimlarida allaqachon bor ma'lumot (Spot, 22.10.2026).
- Saytda (my.gov.uz, bank ilovasi) adashib qoladi, yordam beradigan odam yo'q.
- Natijada ariza ko'p, kredit kam: TadbirCore'da 01.06–17.09.2026 da 3 262 ariza, 1 005 kredit (31 foiz). Davlat banklari bir yilda 35 000 mijozni garov yoki kafil yo'qligi uchun rad etgan.

Manbalar: `MANBALAR.md`, `TANQID.md`, `QOIDALAR.md`.

## Yetak nima qiladi

1. **Holatni aniqlaydi.** Oddiy suhbat (lotin, kirill yoki rus tilida): qanday biznes (ro'yxatdan o'tgan shakli va hajmi), qancha ishlaydi, qancha tushum va xarajat, qancha pul va nimaga kerak (kengaytirish, uskuna, aylanma mablag'), garov va kredit tarixi.
2. **Mos bankni topadi.** Tekshirilgan bank mahsulotlari bilan solishtiradi va **eng mos 1–2 bankni** aniq raqam bilan ko'rsatadi: summa, foiz, muddat, taxminiy oylik to'lov. Har shart yonida ✓ / ✗ / ?. Hisobni kod qiladi.
3. **Halol javob beradi.** «Mos bank topildi — endi hujjatlar kerak», «Hali emas — mana shuni tuzating», yoki «Hozircha ariza bermang» (zarar bilan ishlasa).
4. **Hujjatlarni birga tayyorlaydi.** Shu bank uchun kerakli hujjatlar ro'yxati, har birini qayerdan va qanday olish (my.gov.uz da nima deb qidirish, necha daqiqa, qancha turadi). Tadbirkor rasmga olib yuklaydi — AI tekshiradi (to'g'ri hujjatmi, o'qiladimi, sanasi, ismi). Pul oqimi qoralamasini Yetak o'zi tuzadi.
5. **Saytda adashsa — yo'l ko'rsatadi.** Tadbirkor ekran rasmini yuboradi («mana bu chiqyapti») — agent qaysi tugmani bosishni aytadi.
6. **Bitta papka beradi.** Muqova, hujjatlar ro'yxati, qoralamalar va yuklangan hujjatlar — bitta PDF. Rozilik bilan bank oynasida ham ko'rinadi.

Arizani va imzoni tadbirkor o'zi qo'yadi.

## Hujjatlarni yig'ish: ikki yo'l

- **A. Rasmiy ruxsat bilan avtomatik (keyingi bosqich).** Davlat bilan kelishuv bo'lsa, tadbirkor roziligi bilan hujjatlarni o'zimiz yig'amiz. Hozir bu mumkin emas: kirish tadbirkorning OneID va elektron imzosi orqali, imzoni faqat egasi ishlatadi.
- **B. Yo'l ko'rsatib yordam (hozir).** Har hujjat uchun aniq qadamlar, skrinshot orqali yordam, AI tekshiruvi va papka.

## Kimga

Biznes krediti olmoqchi bo'lgan kichik tadbirkor: YaTT, o'zini o'zi band, kichik MChJ. Ayniqsa rad javobini olganlar va bankka birinchi marta boradiganlar. Ipoteka va iste'mol krediti — hozir emas.

Biznes hajmi toifalari (mikro, kichik, o'rta) — qonundagi chegaralar bilan, `QOIDALAR.md` ga manbasi bilan yoziladi.

## Pul (reja — hech kim hali to'lamagan)

- **Tadbirkor uchun yo'l ko'rsatish bepul.**
- **«Hujjatlarni biz tayyorlaymiz»** — 10–20 ming so'm (demoda to'lov ulanmagan).
- **Bank** tayyor, tekshirilgan mijoz uchun haq to'laydi — faqat kredit berilganda. Hech bir bank hali tasdiqlamagan. Chet el misoli: AQShdagi Lendio.

## Farqimiz

| | TadbirCore | Yetak |
|---|---|---|
| Qachon | Ariza paytida | Arizadan oldin |
| Nima beradi | Arizani qabul qiladi, banklarga tarqatadi | Mos bankni tanlab, hujjatlarni birga tayyorlaydi |
| Kimga | Tayyor, elektron imzosi bor tadbirkorga | Hali tayyor bo'lmaganlarga ham |
| Qanday | Forma | Oddiy suhbat, skrinshot bilan yordam |
| Kim tomonida | Bank va davlat | Tadbirkor |

Yetak TadbirCore'ga raqib emas: undan o'tgan odam bankka tayyor holda boradi.

## Agent hech qachon qilmaydigan narsalar

- Raqamni o'zgartirmaydi yoki «chiroyli» qilmaydi.
- Hujjat soxtalashtirmaydi, imzo qo'ymaydi.
- «Kredit olasiz» deb va'da bermaydi.
- Tadbirkor roziligisiz ma'lumotni hech kimga ko'rsatmaydi.

## Texnik qoida

Hisob-kitob, hukm va bank tanlash — oddiy kod (`server/src/natija.ts`, `mahsulotlar.ts`). Sun'iy intellekt gaplashadi, tushuntiradi, hujjat va skrinshotni o'qiydi.
