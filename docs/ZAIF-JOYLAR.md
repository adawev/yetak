# Xizmatdagi zaif joylar

Sana: 2026-11-18. Tekshirilgan holat: `main` @ `06cd008` (#14).
Muallif: 4-rol (zaif joylar), Claude yordamida.

Bu hujjat **tadbirkor olayotgan xizmat**dagi aniq zaif joylarni sanaydi: kod qayerda, nima chiqadi, nima qilish kerak, kim qiladi. Biznes, pul va hakam savollari `TANQID.md` da.

## Qanday tekshirildi

- Kod o'qildi: `server/src/rules.ts`, `mahsulotlar.ts`, `agent.ts`, `app.ts`, `web/src/components/*`.
- 4 ta namunaviy profil kodning o'zida (`baholash()` va `mahsulotlarniMoslash()`) ishga tushirildi. Natijalar pastda.
- **Sinalmagan:** Claude bilan jonli suhbat (API kalit bilan), serverga yuk, rus/kirill yozuvida yozgan tadbirkor, boshqa telefon.

## Xulosa jadvali

| № | Zaif joy | Og'irlik | Dalil | Kim tuzatadi |
|---|---|---|---|---|
| 1 | Hukm va mahsulot kartasi bir-biriga zid | Juda yuqori | Kodda sinalgan | Sardor (`server/`) |
| 2 | Kredit tarixi kartasi ekranda simulyatsiya deb yozilmagan | Juda yuqori | Kodda ko'rilgan | Chat egasi (`web/`) |
| 3 | «Tayyor» noaniq holatda ham chiqadi | Yuqori | Kodda sinalgan | Sardor |
| 4 | Hukm tadbirkor aytgan raqamga tayanadi | O'rta | Kodni o'qish | Sardor + agent ko'rsatmasi |
| 5 | Natijani olib ketib bo'lmaydi | O'rta | Kodni o'qish | Chat egasi |
| 6 | Tadbirkor ketgach aloqa uziladi | O'rta | Kodni o'qish | Keyingi bosqich |
| 7 | Til va kanal | O'rta | Qisman sinalgan | Keyingi bosqich |
| 8 | Hujjatlar o'rtasida ziddiyat (sana, faoliyat muddati) | Yuqori (tez tuzatiladi) | Hujjatlarni solishtirish | Hamma |

---

## 1. Hukm va mahsulot kartasi bir-biriga zid

**Nima bor.** Bir xizmatda ikki joyda ikki xil qoida turadi:
- `rules.ts` hukm chiqaradi: garov kredit summasining 125% idan kam bo'lsa — «to'siq»; faoliyat 6 oydan (Kapitalbank reklama maqolasi).
- `mahsulotlar.ts` bank mahsulotlariga moslaydi: Hamkorbank 100 mln gacha garovsiz, kamida 1 yil faoliyat (bank pasporti).

Bu `CLAUDE.md` dagi «Bir joyda bir mantiq» qoidasiga zid.

**Kodda sinalgan natijalar:**

| Profil | Hukm (`rules.ts`) | Mahsulotlar (`mahsulotlar.ts`) |
|---|---|---|
| **B.** YaTT, 18 oy, summa 100 mln, 12 oy, garov yo'q, tarix yaxshi, ERI bor | **hali_emas** (to'siq: garov) | Hamkorbank **mos**, Ipak Yo'li va TBC qisman |
| **C.** YaTT, 8 oy, summa 50 mln, garov 80 mln, tarix yaxshi | **tayyor** | Hamkorbank, Ipak Yo'li, Mikrokreditbank **mos emas**; TBC qisman |

**Nega xavfli.**
- B: tadbirkor «Hali tayyor emassiz, garov yo'q» eshitadi, kartada esa Hamkorbank «mos» turibdi. Garovsiz tadbirkor bizning asosiy mijozimiz (35 000 rad). Ekranning bir qismi uni qaytaradi, ikkinchisi chaqiradi.
- C: «Arizangiz tayyor» deymiz, lekin 4 tadan 3 mahsulot rad etadi, chunki ular 1 yil so'raydi.
- Qadamni «bajarildi» deb belgilash hukmni o'zgartirmaydi: `bajarilgan` faqat belgi qo'yadi (`rules.ts`, oxirgi qism). Matn esa «qadamlarni bajarsangiz, ariza berishingiz mumkin» deydi.

**Yechim.**
1. Hukmni mahsulot moslashdan chiqarish. `tayyor` — kamida bitta mahsulot `mos`; `hali_emas` — hech biri mos emas, lekin `qisman` bor yoki tuzatiladigan to'siq; `olmang` — hozirgi mantiq (zarar, to'lov foydadan katta).
2. Garov to'sig'i garovsiz mahsulot `mos` bo'lsa yoki kafolat yo'li ochiq bo'lsa chiqmasin.
3. `minFaoliyatOy` va garov qoidasini bitta manbadan olish (`mahsulotlar.ts` jadvalidan).
4. Hukm matnidagi «qadamlarni bajarsangiz ariza berishingiz mumkin» ni qadam ishlagandagina qoldirish.

## 2. Kredit tarixi kartasi ekranda simulyatsiya deb yozilmagan

**Nima bor.** `web/src/components/KreditTarixi.tsx`: «Roziman — tekshiring» → «Kredit byurosiga so'rov yuborilmoqda…» → «Kredit byurosi · roziligingiz bilan · 14:32».
Aslida byuroga so'rov yo'q: natija tadbirkor suhbatda aytgan `kredit_tarixi` dan chiziladi.

**Nima ko'rinadi:** «simulyatsiya» so'zi faqat kod izohida (1–4 qatorlar) va `DEMO.md` dagi «pitchda ayting» eslatmasida bor. Ekranda yo'q.

**Nega xavfli.**
- Hakam yoki tadbirkor o'zi sinab ko'rsa, haqiqiy byuro natijasini ko'rdim deb o'ylaydi.
- «Roziman» tugmasi rozilik so'raydi, lekin hech narsa so'ralmaydi: soxta rozilik jarayoni.
- `CLAUDE.md`: «Faktni o'ylab topma», «Tadbirkorning roziligisiz...». Bu qoida yuzasidan eng sezgir joy.
- Pitchda aytishni unutsak, butun loyihaning «halol» obrazi buziladi.

**Yechim (10 daqiqalik ish).** Kartaga ko'rinadigan belgi qo'shish: «DEMO: kredit byurosiga hali ulanmaganmiz, natija sizning javobingizdan». «Kredit byurosi · roziligingiz bilan» yozuvini olib tashlash. Pitchdagi eslatma qoladi.

## 3. «Tayyor» noaniq holatda ham chiqadi

**Kodda sinalgan:** profil **D** — o'zini o'zi band qilgan, 20 oy, summa 30 mln, garov 50 mln, tarix yaxshi.
- Hukm: **tayyor** (faqat ogohlantirish: «shartlarini hali aniqlay olmadik»).
- Mahsulotlar: Hamkorbank, TBC, Mikrokreditbank — hammasi `qisman` (shart noma'lum), Ipak Yo'li mos emas.

Ya'ni bank talabini bilmay turib «Arizangiz tayyor» deymiz. `CLAUDE.md`: «Kredit olasiz» demaymiz, «Arizangiz tayyor» deymiz, lekin bu so'z faqat asosli bo'lsa.

**Yechim.** `tayyor` uchun kamida bitta mahsulot `mos` bo'lsin (1-bandning yechimi). Hammasi `qisman` bo'lsa: «Shartlar bank bilan tasdiqlanishi kerak» deyilgan alohida holat.

## 4. Hukm tadbirkor aytgan raqamga tayanadi

- **Tushum va xarajat so'zdan olinadi.** Foyda = tushum − xarajat. Oilaviy xarajat, o'z maoshi kirmaydi. Bitta oy so'raladi: mavsumiy biznesda aldaydi. Bank esa hisob raqami aylanmasi va hujjatga qaraydi.
- **«Hozir qarz olmang»** (`olmang`) — qat'iy moliyaviy maslahat. Asosi tadbirkorning o'z raqami.
- **Stavka bitta raqam (20,4%), manbasi yo'q** (`rules.ts`, `QOIDA.yillikStavka`). Kodda sinab ko'rildi: 100 mln, 12 oy uchun oylik to'lov 20,4% da 9,28 mln, 30% da 9,75 mln, 38% da 10,15 mln. Farq 5–9%: hukmni kamdan-kam o'zgartiradi. Asosiy xavf raqam kattaligi emas, manbasizligi.

**Yechim.**
1. Hukm matniga «siz aytgan raqamlarga ko'ra» qo'shish.
2. So'nggi 3 oyning o'rtachasini va oilaviy xarajatni so'rash (yoki hech bo'lmasa agent ko'rsatmasiga qo'shish).
3. Stavkani oraliq sifatida ko'rsatish, manbasini ko'rsatish (PQ-312 bo'yicha 19–23%, tijorat 30–38%: `banklar_tekshirilgan.md`).
4. «Olmang» o'rniga «Hozircha ariza bermang, avval...» deb yumshatish.

## 5. Natijani olib ketib bo'lmaydi

- Mahsulotlar kartasida «siz olib borasiz» va «bank o'zi tekshiradi» ro'yxati bor. Bu yaxshi.
- Lekin tadbirkor uni saqlay olmaydi, chop eta olmaydi, ulasha olmaydi: `web/src` da buning kodi yo'q (qidirildi: chop, pdf, yuklab olish, nusxa — faqat `Bank.tsx` da xato matni chiqdi).
- TadbirCore bilan ulanish yo'q: tadbirkor hamma ma'lumotni u yerda qaytadan kiritadi.
- `QARORLAR.md` (17-noyabr): «Mahsulot: agent hujjatlarni birga tayyorlaydi va bankka yetkazadi». Hozir «yetkazish» faqat bank oynasidagi demo.

**Yechim.** Bir sahifali «Bankka olib boraman» varaqasi: profil, hisob, mos mahsulotlar, hujjatlar ro'yxati. Chop etish/PDF tugmasi (brauzerning `print` i yetadi). Raqamlarni kod qo'yadi, agent emas.

## 6. Tadbirkor ketgach aloqa uziladi

- Suhbat raqami brauzerning `localStorage` ida saqlanadi (`useSessiya.ts`). Boshqa telefon yoki brauzerda eski suhbat topilmaydi.
- Eslatma yo'q: `qayta_tekshirish` qadami matnda «qayting» deydi, qaytarib chaqiradigan narsa kodda yo'q.
- Demak «haftalar davomida yetaklaydi» (`RAQOBAT.md` dagi farqimiz) hozircha so'z. Slaydda «keyingi bosqich» deyilishi kerak (`DEMO.md` shunday yozgan).

**Yechim (keyingi bosqich).** Telefon raqami yoki Telegram orqali qaytish. Hozir: demoda rejalashtirilgan funksiya sifatida ko'rsatish.

## 7. Til va kanal

- Agent ko'rsatmasi: «o'zbek tilida (lotin yozuvi)». Kirill yozuvida yoki rus tilida yozgan tadbirkorga nima chiqishi sinalmagan.
- Telegram yo'q: `server/src`, `web/src` va `package.json` da «telegram» so'zi topilmadi. `CLAUDE.md` «bot va veb» deydi, hozir faqat veb bor. Tadbirkorlar ko'p Telegramda.
- Ro'yxatdan o'tmagan tadbirkor bitta noaniq qadam oladi («davlat xizmatlari markazida so'rang»); yo'li kodda aniq emas.

**Yechim.** Kirill/rus xabarini sinab ko'rish va natijani yozish; ko'rsatmaga «tadbirkor qaysi tilda yozsa, shunda javob ber» qo'shish mumkinmi, jamoa hal qiladi. Telegram: keyingi bosqich.

## 8. Hujjatlar o'rtasida ziddiyat

- **Pitch sanasi:** `CLAUDE.md` (26-qator) va `VAZIFALAR.md` (5-qator) ga ko'ra 19-noyabr 10:00; `DEMO.md` (3-qator) ga ko'ra **18-noyabr 19:00** (bugun). Qaysi to'g'ri — jamoa darrov aniqlashtirsin.
- **Faoliyat muddati:** `rules.ts` — 6 oy (Kapitalbank reklama), `mahsulotlar.ts` — 12 oy (Hamkorbank, Ipak Yo'li bank sahifalari). 1-bandning bir qismi.
- **`QARORLAR.md`:** «Reja: 3–5 bank bilan shartnoma», «bank faqat natija uchun to'laydi» — `DEMO.md` buni «reja, hech bir bank tasdiqlamagan» deb to'g'ri aytadi. Slaydlar ham shunday aytsin.

---

## Avvalgi baholarimdagi xatolar va eskirgan joylar

Shu hujjatni yozishdan oldin `main` ni qayta tekshirdim. Quyidagilar oldingi tahlilda noto'g'ri yoki eskirgan edi:

| Oldingi da'vo | Holat |
|---|---|
| «Aniq bank mahsuloti tanlanmaydi» | Eskirgan: `mahsulotlar.ts` (4 mahsulot) qo'shilgan (#12). Lekin hukm u bilan kelishmaydi: 1-band |
| «`QOIDALAR.md` bo'sh, agent hujjat va jarayonni bilmaydi» | Eskirgan: #13 da to'ldirilgan; faqat ayrim ustunlarda «topilmadi» qolgan |
| «Kredit tarixi yo'q — PQ-312 ijobiy tarix talab qiladi» | **Xato:** Hamkorbank pasporti «ijobiy yoki umuman yo'q» deydi. `rules.ts` ogohlantirishi to'g'ri |
| «Stavka 20,4% o'rniga 30–38% — to'lov ancha katta» | **Bo'rttirilgan:** farq 5–9% (4-band) |

## Hali ochiq (boshqa hujjatlarda)

- Pulni kim to'laydi, haqiqiy tadbirkor va bank xodimi suhbati: `TANQID.md`, `VAZIFALAR.md` 4-rol.
- Rozilik matni, ma'lumot chet elga ketishi, vositachilik ruxsati: `OCHIQ-SAVOLLAR.md`; yurist javobi kutilmoqda.
- Foiz kompensatsiyasi miqdori, «Biznes start» shartlari: `QOIDALAR.md` da «topilmadi».
