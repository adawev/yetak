# Yetak — vision

**Bir gapda:** TadbirCore — bankning eshigi. Yetak — o'sha eshikkacha bo'lgan yo'l.

## Muammo

Tadbirkorga pul kerak, lekin u kredit yo'lini bilmaydi.

- Qaysi kredit yoki davlat dasturi unga mos — bilmaydi.
- Nega rad etilishi mumkin va nimani tuzatish kerak — bilmaydi.
- Qayerga borishni bilmaydi. Davlat platformasi TadbirCore borligini ham ko'pchilik bilmasligi mumkin: unga arizalar soni iyuldagi 1 465 tadan avgustda 596 taga tushgan.
- Garovi, kredit tarixi yoki elektron imzosi bo'lmasa, yo'l umuman yopiqdek ko'rinadi.

Raqamlar:
- TadbirCore'da 01.06–17.09.2026 da 3 262 ariza, 1 005 kredit (31 foiz).
- Davlat banklari bir yilda 35 000 mijozni garov yoki kafil yo'qligi uchun rad etgan.
- Kichik korxonalarning faqat 10 foizi kredit ishlatadi.

Manbalar: `MANBALAR.md`, `TANQID.md`.

## Yetak nima qiladi

Sun'iy intellektli agent tadbirkor bilan oddiy tilda gaplashadi va uni kreditgacha yetaklaydi.

1. **Holatni aniqlaydi.** Nima ish, qancha tushum, garov bormi, kredit tarixi bormi, pul nimaga kerak.
2. **Halol javob beradi.** Uch yo'ldan biri:
   - «Hozir mana bu dasturga mos kelasiz.»
   - «Hali tayyor emassiz. Mana bu 3 ishni qiling, keyin olasiz.»
   - «Hozir qarz olmang.» Sababi bilan.
3. **Reja beradi.** Qadam-baqadam: qaysi hujjat, qaysi dastur, qachon.
4. **Yetaklaydi.** Qancha qolganini ko'rsatadi, eslatadi, tushunmagan joyini tushuntiradi.
5. **Eshikkacha olib boradi.** Tayyor bo'lganda TadbirCore yoki bankka yo'naltiradi. Arizani tadbirkor o'zi yuboradi.

## Kimga

Kredit olmoqchi bo'lgan har qanday kichik tadbirkor. Ayniqsa:
- TadbirCore yoki bankdan rad javobi olganlar;
- garovi, kredit tarixi yoki elektron imzosi yo'qlar;
- TadbirCore va davlat dasturlari haqida umuman bilmaydiganlar.

Birinchi foydalanuvchi — tadbirkorning o'zi. Veb chat orqali kiradi.

## Pul

Tadbirkor uchun bepul. Bank faqat natija uchun to'laydi: Yetak orqali kelgan mijozga kredit berilganda.

Bu reja. Hech bir bank hali tasdiqlamagan. Taqdimotda shunday aytiladi.

Chet el misoli: AQShdagi Lendio tadbirkor uchun bepul, kredit berilganda kreditor haq to'laydi.

## Farqimiz

| | TadbirCore | Yetak |
|---|---|---|
| Qachon | Ariza paytida | Arizadan oldin va rad javobidan keyin |
| Kimga | Tayyor, elektron imzosi bor tadbirkorga | Hali tayyor bo'lmaganlarga ham |
| Nima beradi | Ariza qabul qiladi, rad sababini aytadi | Rejani beradi va bajarilguncha yetaklaydi |
| Qancha vaqt | Bir marta | Haftalar davomida |
| Kim tomonida | Bank va davlat | Tadbirkor |

Yetak TadbirCore'ga raqib emas. Undan o'tgan odam TadbirCore'ga tayyor holda boradi.

## Agent hech qachon qilmaydigan narsalar

- Raqamni o'zgartirmaydi yoki «chiroyli» qilmaydi.
- Hujjat yaratmaydi, imzo qo'ymaydi.
- «Kredit olasiz» deb va'da bermaydi.
- Tadbirkor roziligisiz ma'lumotni hech kimga yubormaydi.

## Mahsulot qismlari

1. Tadbirkor chati (veb).
2. Tekshiruv qoidalari: davlat dasturlari va bank talablari, manbasi bilan, kodda.
3. Bank oynasi: bank xodimi tayyor mijozni ko'radi.

## Texnik qoida

Hisob-kitob va qoidalarni oddiy kod bajaradi. Sun'iy intellekt gaplashadi, tushuntiradi va hujjatni o'qiydi.
