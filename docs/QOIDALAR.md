# Kredit qoidalari (tadqiqotchi to'ldiradi)

Agent shu faylga tayanadi. Sardor bu yerdagi qatorlarni `server/src/rules.ts` ga kiritadi.

**Qoida:** har bir qatorda manba havolasi. Manbasiz raqam yozilmaydi. Topilmasa — «topilmadi».
**Holat ustuni:** `tasdiqlangan` (rasmiy sahifa yoki bank xodimi) · `matbuot` (yangilik sayti) · `topilmadi`.

## 1. Banklarning umumiy talablari

Hozir bor (ochiq manbalardan, bank bilan tasdiqlanmagan):

| Talab | Qiymat | Manba | Holat |
|---|---|---|---|
| Faoliyat muddati | kamida 6 oy | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) | matbuot (reklama) |
| Garov | kredit summasining kamida 125 foizi | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) | matbuot (reklama) |
| Zarar | zarar bilan ishlamasligi kerak | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) | matbuot (reklama) |
| Kredit tarixi | salbiy tarix bo'lmasligi kerak | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) | matbuot (reklama) |
| O'rtacha foiz stavkasi (yuridik shaxs, aylanma mablag') | 23,1% (banklar bo'yicha 20,5% – 33,1%); asosiy vosita uchun 22,7% | [Markaziy bank, 21.09.2026](https://cbu.uz/upload/medialibrary/9ca/bvticcmgifan5k0kcyg11nyajwjta1ov/Foiz_stavkalar_21_09_2026.pdf) | tasdiqlangan (yakuniy foiz har mijozga alohida) |
| Pul oqimi: to'lov foydaning necha foizidan oshmasligi kerak | Aniq foiz topilmadi. Bank faqat «loyiha pul oqimi kreditni qoplashga yetarlimi» deb qaraydi | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) | topilmadi (foiz) |
| Litsenziya / ruxsatnoma | faoliyat litsenziyani talab qilsa, u bo'lishi shart; yo'qligi — ko'p uchraydigan rad sababi | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) | matbuot (reklama) |
| Rahbar va ta'sischilar kredit tarixi | bank kompaniya bilan birga rahbar va ta'sischilarning tarixini ham ko'radi | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) | matbuot (reklama) |
| Bankda hisob raqam | Kapitalbankda barcha kreditlar uchun majburiy; Ipak Yo'li onlayn kreditida ham shart | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/), [Ipak Yo'li](https://en.ipakyulibank.uz/legal/credit/online-loan-for-business) | tasdiqlangan (Ipak Yo'li) |

## 2. Davlat dasturlari

| Dastur | Kimga | Shart | Qancha | Manba | Holat |
|---|---|---|---|---|---|
| Kafolat (Tadbirkorlikni rivojlantirish kompaniyasi) | Garovi yetmaydiganlarga | ? | Kredit summasining 75 foizigacha | [gov.uz](https://gov.uz/oz/quvasoy/news/view/224414) | tasdiqlangan; to'liq shartlar topilmadi |
| Garovsiz mikrokredit | Ilgari mikrokredit olgan, tarixi yaxshi | ? | 200 mln so'mgacha | [Anhor](https://anhor.uz/news/microcredit-boost/) | matbuot |
| Foiz kompensatsiyasi | ? | Kredit tarixini shart qilish taqiqlangan | ? | [Spot](https://www.spot.uz/oz/2026/09/12/loans-entrepreneurs/) | matbuot |
| «Biznes start» | ? | ? | 200 mln so'mgacha garovsiz | [gov.uz](https://gov.uz/oz/bv-jizzax/news/view/207503) | to'liq shartlar topilmadi |
| Oilaviy tadbirkorlik | ? | ? | ? | | topilmadi |

## 3. Aniq bank mahsulotlari (2–3 bank)

Har bank uchun bitta kichik biznes krediti.

To'liq tafsilot: `docs/tadqiqot/banklar_tekshirilgan.md`.

| Bank | Mahsulot | Summa | Muddat | Foiz | Garov | Kimga | Manba |
|---|---|---|---|---|---|---|---|
| Ipak Yo'li | Tadbirkorlar uchun onlayn kredit | 200 mln so'mgacha | 12 oygacha | 30% | yo'q | YaTT; oxirgi 12 oyda aylanma bor; shu bankda hisob raqam | [bank sahifasi](https://en.ipakyulibank.uz/legal/credit/online-loan-for-business) |
| Hamkorbank | «Kichik biznesga ko'mak» (PQ–312) | 300 mln so'mgacha (100 mln garovsiz) | asosiy vosita 84 oy, aylanma 36 oy | 18–24% (hudud toifasiga qarab, 100 mln gacha qismi) | 100 mln dan yuqori qismi — ko'chmas mulk, transport yoki depozit | kichik biznes; kamida 1 yil faoliyat; ijobiy yoki bo'sh kredit tarixi | [kredit pasporti](https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf) |
| Mikrokreditbank | «Biznesga birinchi qadam» | 50 mln so'mgacha | 24–84 oy | 21% | 125% — kafillik yoki mulk (garovsiz emas) | 18–55 yosh, o'zini o'zi band qilgan | [bank sahifasi](https://mkbank.uz/uz/private/crediting/biznesga-birinchi-qadam-mikroqarz/) |

**Diqqat (qarama-qarshilik):** NBU'ning PQ-312 pasportida 300 mln dan **150 mln** Tadbirkorlikni rivojlantirish kompaniyasidan, foiz 19–23%, imtiyozli davr 36 oygacha; garov o'rniga kompaniya kafolat depoziti (hudud toifasiga qarab 20–80%) + sug'urta polisi + bank qismi uchun 125% likvid garov ([NBU pasporti](https://nbu.uz/assets/files/pq-312-(loiixa-pasporti)--lat.pdf)). Hamkorbank pasportida esa 100 mln. Qaysi biri yangi ekanini bankdan aniqlash kerak — `OCHIQ-SAVOLLAR.md` ga.

## 4. Hujjatlar ro'yxati

Bank aynan nimani so'raydi (bitta bank misolida). Qaysi biri davlat tizimidan avtomatik olinadi, qaysisini tadbirkor o'zi olib keladi.

**Asosiy topilma:** davlat banklari qarz oluvchidan **102 ta hujjat** so'raydi; shundan **53 tasi (≈52%)** onlayn tizimlarda allaqachon bor ma'lumotni takrorlaydi, **22 tasi (≈22%)** kreditga umuman aloqasiz — [Spot, 22.10.2026](https://www.spot.uz/oz/2026/10/22/loans-redundancy/) (matbuot). 500 mln so'mgacha kreditlarda biznes-rejani olib tashlash taklif qilingan (o'sha manba).

### 4.1. Kapitalbank — yuridik shaxs (standart to'plam)

| Hujjat | Kim beradi | Avtomatik olinadimi | Manba |
|---|---|---|---|
| Kredit arizasi | tadbirkor (bank shakli) | yo'q | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) |
| Ta'sis hujjatlarining barcha tahrirlari | tadbirkor | topilmadi | o'sha |
| Ruxsat beruvchi hujjatlar (litsenziya) | tadbirkor / litsenziya bergan idora | topilmadi | o'sha |
| Ta'sischilarning kredit olish haqida qarori va rahbar buyrug'i | tadbirkor | yo'q | o'sha |
| Faoliyat joyi hujjati (mulk yoki ijara) | tadbirkor | topilmadi | o'sha |
| Yillik va oxirgi davr moliyaviy hisoboti (balans + moliyaviy natijalar), batafsil shaklda | tadbirkor (buxgalter) | topilmadi | o'sha |
| Boshqa banklardagi hisoblar aylanmasi haqida ma'lumotnoma | boshqa banklar | topilmadi | o'sha |
| Garov hujjatlari: mulk huquqi + mustaqil baholovchi hisoboti | tadbirkor + baholovchi (pullik) | yo'q | o'sha |
| Kredit tarixi (kompaniya) | kredit byurosi | YIDXP orqali 2023-yil iyuldan; qo'shimcha hujjat kerak emas | o'sha |

### 4.2. Kapitalbank — yakka tartibdagi tadbirkor (YaTT)

| Hujjat | Kim beradi | Avtomatik olinadimi | Manba |
|---|---|---|---|
| Kredit arizasi | tadbirkor | yo'q | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) |
| Ruxsat beruvchi hujjatlar | tadbirkor | topilmadi | o'sha |
| Faoliyat joyi hujjati | tadbirkor | topilmadi | o'sha |
| Daromad manbalari haqida ma'lumot | tadbirkor | topilmadi | o'sha |

### 4.3. Hamkorbank — «Kichik biznesga ko'mak» (davlat dasturi)

| Hujjat | Kim beradi | Avtomatik olinadimi | Manba |
|---|---|---|---|
| Buyurtmanoma (ariza) | tadbirkor | yo'q | [Hamkorbank pasporti](https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf) |
| Pul oqimi prognozi | tadbirkor | yo'q | o'sha |
| Boshqaruv organi roziligi (yuridik shaxs) | tadbirkor | yo'q | o'sha |
| Oldi-sotdi shartnomasi (nima sotib olinadi) | tadbirkor + sotuvchi | yo'q | o'sha |
| Faoliyat joyi hujjati — yoki kredit mutaxassisi joydagi kassa/terminal cheklarini asos qiladi | tadbirkor / bank xodimi | qisman | o'sha |
| 100 mln dan ortiq qismi uchun garov hujjatlari | tadbirkor | yo'q | o'sha |

### 4.4. Onlayn kreditlar — qog'oz hujjat deyarli yo'q

| Bank | Nima tekshiriladi | Avtomatik olinadimi | Manba |
|---|---|---|---|
| Ipak Yo'li (onlayn) | oxirgi 12 oy aylanma, shu bankdagi hisob | ha — ilovada avtomatik, qaror bir necha daqiqada | [bank sahifasi](https://en.ipakyulibank.uz/legal/credit/online-loan-for-business) |
| Mikrokreditbank «Biznesga birinchi qadam» | ID/pasport, o'zini o'zi band qilganlik guvohnomasi, ta'minot hujjatlari | yo'q — bank ofisida | [bank sahifasi](https://mkbank.uz/uz/private/crediting/biznesga-birinchi-qadam-mikroqarz/) |

### 4.5. Har bir bank har doim tekshiradigan narsalar (hujjat emas, baza)

| Nima | Qayerdan | Manba |
|---|---|---|
| Kredit tarixi | Kredit-axborot tahliliy markazi (KATM); barcha kredit tashkilotlari kredit berishdan oldin foydalanadi | [Kun.uz / Markaziy bank](https://kun.uz/news/2022/05/25/mb-tijorat-banklari-nega-koplab-fuqarolarning-kredit-sorovlarini-rad-etayotganini-tushuntirdi) |
| «Kredit bitimi tuzish taqiqlangan shaxslar» reestri (odam o'ziga kredit taqiqini qo'ygan bo'lsa) | kredit byurosi | [Anhor](https://anhor.uz/uzl/news/onlayn-kreditlarni/), [Hamkorbank shartnomasi](https://hamkorbank.uz/assets/docs/credits/umumiy-shartlar-mikrokredit-start.pdf) |
| Qarz yuki va muddati o'tgan qarz | kredit byurosi | [Daryo](https://daryo.uz/SqDAb0w7) |
| Kelajakda: platformadagi pul aylanmasi ham kreditda hisobga olinadi | soliq platformasi | [Anhor](https://anhor.uz/uzl/news/qr-kod-elektron-hamyon-va-1-soliq-kichik-biznesga-qulayliklar/) |

**Topilmadi:** banklarga davlat tizimida bor hujjatni qog'ozda so'rashni taqiqlovchi aniq norma (lex.uz havolasi). Bank xodimidan so'rash kerak.

## 5. Rad etish sabablari

| Sabab | Qanchalik tez-tez | Tuzatsa bo'ladimi, qanday | Manba |
|---|---|---|---|
| Garov yoki kafil yo'q | 35 000 rad (davlat banklari, yil boshidan) — boshqa sabablar bo'yicha son topilmadi | Kafolat dasturi; garovsiz onlayn kredit (Ipak Yo'li, TBC); PQ-312 ning garovsiz qismi | [Spot](https://www.spot.uz/oz/2026/10/22/loans-redundancy/) |
| Salbiy kredit tarixi (muddati o'tgan qarz) | topilmadi | Qarzni yopish. Hamkorbank PQ-312: so'ndirilmagan muddati o'tgan qarz yo'q va 12 oyda kechikishlar jami 90 kundan oshmasa — o'tadi | [Kun.uz / MB](https://kun.uz/news/2022/05/25/mb-tijorat-banklari-nega-koplab-fuqarolarning-kredit-sorovlarini-rad-etayotganini-tushuntirdi), [Hamkorbank](https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf) |
| Kredit tarixi umuman yo'q | topilmadi | Ba'zi banklar salbiy deb qaraydi; Hamkorbank PQ-312 da «tarix yo'q» qabul qilinadi | [Depozit.uz](https://depozit.uz/uz/news/kredit-rad-etilishining-top-12-sababi) (matbuot), [Hamkorbank](https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf) |
| Qisqa vaqtda ketma-ket rad javoblari | topilmadi | Har bankka birdan ariza bermaslik: arizalar va natijalar kredit tarixida yoziladi | [Depozit.uz](https://depozit.uz/uz/news/kredit-rad-etilishining-top-12-sababi) (matbuot) |
| Zarar bilan ishlash (balansda) | topilmadi | Foydali davr hisobotini kutish | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) |
| Litsenziya yo'q | «ko'p uchraydigan sabab» (son yo'q) | Litsenziyani olish | o'sha |
| Faoliyat muddati yetmaydi | topilmadi | Kapitalbank: odatda 6 oy; PQ-312 / Hamkorbank: 1 yil. Yangi tadbirkor — Mikrokreditbank «Biznesga birinchi qadam» | o'sha; [Hamkorbank](https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf); [Mikrokreditbank](https://mkbank.uz/uz/private/crediting/biznesga-birinchi-qadam-mikroqarz/) |
| Pul oqimi kreditni qoplashga yetmaydi | topilmadi | Summani kamaytirish yoki muddatni uzaytirish | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) |
| Qarz yuki oshgan / muddati o'tgan qarz | topilmadi | Bank rad etadi yoki boshqa summada beradi | [Daryo](https://daryo.uz/SqDAb0w7) |
| Kredit taqiqi reestrida turish | topilmadi | Odamning o'zi taqiqni olib tashlashi kerak | [Anhor](https://anhor.uz/uzl/news/onlayn-kreditlarni/) |
| Taqiqlangan maqsad (eski qarzni yopish, qimor, alkogol, tamaki) | topilmadi | Maqsadni o'zgartirish | [Hamkorbank](https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf) |
| Hujjatlar to'liq emas yoki bir-biriga zid | topilmadi | Hujjatni oldindan tekshirish — **Yetak aynan shu yerda yordam beradi** | [Spot / Kapitalbank](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) |

Muhim: bank rad sababini tushuntirishga majbur emas ([Depozit.uz](https://depozit.uz/uz/news/kredit-rad-etilishining-top-12-sababi), matbuot — qonun havolasi topilmadi). Garov hujjatlari keyinroq topshirilsa, bank arizani qayta ko'rib chiqadi ([NBU javobi](https://www.nbu.uz/en/news/namangan-viloyati-to-rako-rg-on-tumanidagi-to-raqo-rg-on-yashil-makon-mchj-rahbari-tomonidan-2023-yi/)).

## 6. Kredit jarayoni qadam-baqadam

Arizadan pul olguncha. Asos: Kapitalbank misoli ([Spot](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/), matbuot). Kunlar faqat manbasi borlari uchun.

| # | Qadam | Necha kun | Manba |
|---|---|---|---|
| 1 | Kredit tarixini o'zi tekshirish (yuridik shaxs — YIDXP orqali) | topilmadi | [Spot](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) |
| 2 | Kredit muddatiga pul oqimi prognozini tayyorlash | topilmadi | o'sha |
| 3 | Bankda hisob raqam ochish va aylanma yuritish | topilmadi | o'sha |
| 4 | Hisob ochilgan filialda maslahat, hujjat yig'ish va topshirish | Hamkorbank: ariza shu kuni ro'yxatga olinadi, hujjatlar 1 ish kunida tekshiruvchi mutaxassisga yuboriladi | o'sha; [Hamkorbank tartibi](https://hamkorbank.uz/assets/docs/credits/Hamkorbank-garovga-olingan-mulklar-bilan-ishlash-tartibi.pdf) |
| 4a | (Oilaviy tadbirkorlik platformasi orqali) hokim yordamchisi xulosasi | 5 kun ichida (VM 373-son qarori) | [Anhor](https://anhor.uz/uzl/news/55-nafar-hokim-yordamchisi-jazolandi/) |
| 5 | Arizani ko'rib chiqish va qaror | aniq muddat topilmadi: hujjat to'liqligiga bog'liq. Onlayn (Ipak Yo'li) — bir necha daqiqa | [Spot](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/), [Ipak Yo'li](https://en.ipakyulibank.uz/legal/credit/online-loan-for-business) |
| 6 | Shartnoma imzolash, garovni rasmiylashtirish (baholovchi hisoboti) | topilmadi | [Spot](https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/) |
| 7 | Pulni olish | Hamkorbank: shartnoma imzolangandan 60 kalendar kun ichida ajratadi | [Hamkorbank shartnomasi](https://hamkorbank.uz/assets/docs/business/credits/Kredit-shartnomasi-2024.pdf) |

Jismoniy shaxs kreditida: bank ijobiy qarordan keyin, pul berilgunga qadar xatarlar «chek-listi»ni berishi shart ([MB 3030-11](https://cbu.uz/upload/medialibrary/2bd/i0vormmhvpuxt6wr9byhqv9ycav67890/3030_11.pdf)) — YaTT ga tatbiq etilishi topilmadi.

**Umumiy muddat (arizadan pulgacha) — topilmadi.** Bank xodimidan so'rash kerak.

## 7. TadbirCore

O'zingiz kirib ko'ring: tadbircore.uz

- Kirish uchun nima kerak?
- Ariza qadamlari (rasmlar `docs/tadqiqot/tadbircore/` ga):
- Rad etilgan odam nimani ko'radi?
- Qaysi banklar va mahsulotlar bor?

## 8. Elektron imzo

| Savol | Javob | Manba |
|---|---|---|
| Qayerdan olinadi | my.gov.uz (onlayn), e-imzo.soliq.uz (onlayn), Davlat xizmatlari markazi (shaxsan). Yuridik shaxs rahbari masofadan oladi, boshqa vakillar — DXM orqali | [Kun.uz, 07.09.2026](https://kun.uz/news/2026/09/07/elektron-raqamli-imzo-qanday-olinadi) |
| Nima kerak | kompyuterda E-IMZO moduli, telefonda MyID ilovasi | o'sha |
| Necha pul (yuridik shaxs / YaTT) | DXM orqali 41 200 so'm, my.gov.uz orqali 37 080 so'm | o'sha — **eski BHM (412 000) bo'yicha; 1-sentyabrdan BHM 440 000, yangi narx topilmadi** |
| Necha pul (jismoniy shaxs) | DXM 28 840 so'm, my.gov.uz 25 956 so'm | o'sha (xuddi shu izoh) |
| Necha kun | topilmadi | |
