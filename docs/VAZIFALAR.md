# Vazifalar — jamoa

Kim qaysi rolni olishini sardor belgilaydi. Har rolda aniq natija va muddat bor.

Muddatlar: **18-noyabr 15:00** oraliq tekshiruv · **19-noyabr 10:00** taqdimot.

Avval hamma o'qiydi: `docs/VISION.md`, `docs/QARORLAR.md`, `docs/TANQID.md`.

---

## 1. Sardor (adawev) — texnik asos (server)

Papka: `server/`, `shared/`

- Qoidalar: hukm, topilmalar, yo'l xaritasi (`rules.ts`).
- Agent: Claude bilan suhbat, profilni to'ldirish.
- Saqlash, API, serverga joylashtirish.
- **Natija (18-noyabr 12:00):** API ishlaydi, chat egasi ulana oladi.
- ✅ **Bajarildi (17-noyabr):** API `https://yetak-api.diyorjon.com` da ishlaydi, agent Claude bilan ulangan, 3 xil tadbirkor haqiqiy suhbatda sinaldi (tayyor, hali emas, olmang). Qo'llanma: `server/README.md`.
- Qolgan bitta bog'liqlik: tadqiqotchi `QOIDALAR.md` ni to'ldirgach, yangi raqamlarni `rules.ts` ga kiritish.

## 2. Chat egasi (muhammadnuruz) — tadbirkor ko'radigan hamma narsa

Papka: `web/`

- Chat ekrani: suhbat, tugmali javoblar, kutish holati.
- Yon panel: jarayon, hukm (uch xil), yo'l xaritasi, qadamni belgilash.
- Rozilik oynasi: ma'lumotni bankka ko'rsatishga ruxsat.
- Bank oynasi (`/bank`): arizalar ro'yxati va bitta ariza.
- Ulanishlar: API bilan ishlash, xato holatlari (internet yo'q, server javob bermadi, agent uzoq o'ylayapti). Har bir xato haqiqiy sababini aytadi.
- Telefonda to'liq ishlashi.
- Boshidan oxirigacha sinash: 3 xil tadbirkor (tayyor, hali emas, olmang).
- Asos: `docs/ARXITEKTURA.md` (API), `shared/types.ts` (turlar), `docs/DIZAYN.md` va dizayn sahifasi (ko'rinish).
- **Natija (18-noyabr 15:00):** bitta tadbirkor telefondan boshidan oxirigacha o'tadi.

## 3. Tadqiqotchi (AlibekIsayev) — kredit aslida qanday beriladi

Fayl: `docs/QOIDALAR.md` (tayyor jadval, to'ldirish kerak)

Bu eng muhim ish: agent aynan shu ma'lumotga tayanadi. Xato ma'lumot — xato maslahat.

- 2–3 bankning kichik biznes kreditlari: summa, muddat, foiz, garov talabi, kimga beriladi, qaysi hujjatlar.
- Davlat dasturlari: kafolat (75 foizgacha), foiz kompensatsiyasi, garovsiz mikrokredit, «Biznes start». Har birining aniq sharti.
- Rad etish sabablari: bank nimaga qarab «yo'q» deydi.
- Kredit jarayoni qadam-baqadam: arizadan pul olguncha nima bo'ladi, necha kun.
- TadbirCore: o'zi kirib, ariza jarayonini boshlab ko'rish, har qadamni rasmga olish.
- **Qoida:** har bir qator yonida manba havolasi. Manbasiz raqam yozilmaydi. Topilmasa «topilmadi» deb yoziladi.
- Manbalar: bank saytlari, lex.uz, cbu.uz, bank xodimi, mentorlar.
- **Natija (18-noyabr 11:00):** `QOIDALAR.md` to'ldirilgan, sardor uni kodga kiritadi.

## 4. Zaif joylar egasi (Ilyos056) — dalil va xavflar

Fayl: `docs/TANQID.md` (muammolar), `docs/OCHIQ-SAVOLLAR.md` (javoblar shu yerga yoziladi)

Mustaqil tanqid 5 ta jiddiy muammo topdi. Bu rol ularni yopadi.

- **Dalil.** 8–10 tadbirkor bilan suhbat (savollar pastda). Natija: «10 kishidan 7 tasi…» degan o'z raqamimiz va 3 ta iqtibos. Bittasini demo uchun ko'ndirish.
- **Pul.** Bank xodimidan so'rash: tayyor mijoz uchun to'larmidingiz, shunday shartnomalar bormi. Bitta «ha» ham katta dalil.
- **Tarqatish.** Tadbirkor Yetakni qanday topadi: hokim yordamchisi, palata, bank filiali. Bittasi bilan gaplashib ko'rish.
- **Qonun.** Rozilik matni (shaxsiy ma'lumot), vositachilikka ruxsat kerakmi. Yurist mentor bo'lsa, undan so'rash.
- **Sinov.** Tayyor mahsulotni 2–3 tadbirkorga berib, fikrini yozib olish.
- **Natija (18-noyabr 15:00):** har muammo yonida javob yoki «topilmadi». Taqdimotchiga raqamlar va iqtiboslar beriladi.

## 5. Taqdimotchi (shoxjahon20007-gif)

- Slaydlar va 3–5 daqiqalik nutq. Tartib: muammo → Yetak → farq → demo → pul → jamoa.
- Mezonlar bo'yicha tekshirish (`MEZONLAR.md`): 15 ta mezonning har biriga javob bormi.
- Hakamning 8 ta qiyin savoliga javoblarni yodlash (`TANQID.md`).
- Demo ssenariysi: nima bosiladi, nima deyiladi. Zaxira: demo videosi.
- «Jamoa» slaydi: kim nima qilgan, nega aynan biz.
- **Natija (18-noyabr 20:00):** birinchi to'liq mashq.

---

## Kim kimga bog'liq

- Tadqiqotchi → Sardor: qoidalar (11:00 gacha).
- Sardor → Chat egasi: ishlaydigan API (12:00 gacha). Ungacha chat egasi `shared/types.ts` asosida soxta ma'lumot bilan ishlaydi.
- Zaif joylar egasi → Taqdimotchi: raqamlar va iqtiboslar (15:00 gacha).

## Git qoidasi

- Har kim o'z papkasida ishlaydi. Boshqaning faylini tahrirlamaydi.
- `shared/types.ts` ni faqat sardor o'zgartiradi. O'zgartirish kerak bo'lsa, undan so'raladi.
- Har kim o'z shoxida (branch) ishlaydi, tayyor bo'lgach PR ochadi.

## Tadbirkorga beriladigan savollar

1. Oxirgi marta qachon kredit olishga harakat qildingiz?
2. Bank nechta hujjat so'radi? Qaysi biri eng qiyin bo'ldi?
3. Necha kun ketdi? Necha marta bankka bordingiz?
4. Kredit oldingizmi? Olmagan bo'lsangiz, sababini aytishdimi?
5. Rad javobidan keyin nima qildingiz?
6. Davlat dasturlari (kafolat, foiz kompensatsiyasi) haqida eshitganmisiz? TadbirCore haqida-chi?
7. Hujjatlarni tayyorlashda kim yordam berdi? Pul to'ladingizmi, qancha?
8. Shunday yordamchi bo'lsa, daromadingiz haqidagi ma'lumotni unga berarmidingiz?

## Bank xodimiga beriladigan savollar

1. Kichik biznes arizalari eng ko'p qaysi 3 sabab bilan rad etiladi?
2. Rad etilgan odamga nima deysiz? U keyin qaytib keladimi?
3. Garovi yo'q tadbirkorga hozir nima taklif qilasiz?
4. Tayyor, oldindan tekshirilgan mijoz kelsa, bu sizga nima beradi?
5. Bank bunday mijoz uchun hamkorga haq to'laydimi? Shunday shartnomalar bormi?
6. TadbirCore'dan kelgan arizalar sifati qanday?
