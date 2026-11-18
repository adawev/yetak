# Yetak — dizayn tizimi

Asos: **shadcn/ui** (Radix + Tailwind). Pastdagi qiymatlar uning tokenlariga qo'yiladi.

## Belgi

`assets/yetak-mark.svg` (yorug' fon), `assets/yetak-mark-dark.svg` (qora fon).

Ma'nosi: kichik nuqta — tadbirkor. Yo'l — biz. Katta to'q sariq nuqta — maqsad (tayyor ariza).

- Belgi atrofida kamida belgi balandligining chorak qismicha bo'sh joy.
- Rangini o'zgartirmang, cho'zmang, soya qo'shmang.
- So'z belgisi: «Yetak», Golos Text 700, harflar orasi −0.02em.

## Ranglar

| Token | Yorug' | Qora | Qayerda |
|---|---|---|---|
| `--background` | `#ffffff` | `#0e1320` | Sahifa foni |
| `--card` | `#ffffff` | `#161c2b` | Kartalar, agent xabari |
| `--surface` | `#f5f6f8` | `#121827` | Ajratilgan bo'lim foni, kiritish maydoni |
| `--foreground` | `#14213d` | `#eef1f7` | Matn, belgi |
| `--muted-foreground` | `#5b6475` | `#9aa4b8` | Ikkinchi darajali matn |
| `--border` | `#e3e6eb` | `#252e42` | Chiziqlar |
| `--primary` | `#f26a1b` | `#ff8a45` | Asosiy tugma, jarayon, belgidagi nuqta |
| `--primary-soft` | `#fde9dc` | `#3a2416` | Foydalanuvchi xabari foni |
| `--success` | `#12805c` | `#5fd0a4` | Tayyor hujjat |
| `--warning` | `#9a6a00` | `#f0c15a` | Yetishmayotgan narsa |
| `--destructive` | `#b93a32` | `#ff8f86` | Xato |

Nega shu ranglar: yashil (Ipak Yo'li, Hamkorbank) va binafsha (Uzum) band, ko'k — banklarning odatiy rangi. To'q sariq iliq va «davom eting» degan ma'no beradi.

To'q sariq faqat bitta narsaga: keyingi qadam. Sahifada bir vaqtda bitta to'q sariq tugma.

## Shrift

- Bitta oila: **Golos Text** 400–700 (o'zbek lotin va kirill harflarini to'liq qo'llaydi). Sarlavha 600–700, harflar orasi −0.02em
- Raqamlar: `tabular-nums`, jadvalda o'ngga tekislangan
- O'lchamlar: 13 / 14 / 16 / 18 / 24 / 32 / 48 / 60

## Shakl

- Burchak: 8px (kichik), 12px (karta), to'liq dumaloq (tugmacha-teglar)
- Soya ishlatilmaydi, chiziq ishlatiladi
- Oraliqlar: 4 ning karralari

## Sahifa qoidalari (2026-11-18)

Yo'nalish: **klassik, minimal, tiniq.** Bank hujjatidek aniq, ortiqcha bezaksiz.

1. **Bitta urg'u.** Har sahifada bitta esda qoladigan element (bosh sahifada — «tayyorgarlik varaqasi»). Qolgani jim.
2. **Holat = nuqta + so'z.** Rangli fonli yorliqlar yo'q: `● Tayyor`, `● Rad etildi`.
3. **Chiziq, karta emas.** Bo'limlar ingichka chiziq bilan ajraladi. Karta faqat ma'lumot guruhi uchun. Soya yo'q.
4. **Asosiy tugma — siyoh rang** (`--foreground`). To'q sariq — belgi va sahifadagi bitta asosiy chaqiriq.
5. **Matn chapga tekislangan**, qator 70 belgidan qisqa. KATTA HARFLI ustki yozuv, bitta so'zni rangga bo'yash, «A · B · C» zanjirlar — ishlatilmaydi.
6. **Harakat faqat javob sifatida** (ochish, saqlash). O'z-o'zidan suzuvchi bezak yo'q.
7. Telefonda 16px yon chekka, gorizontal aylantirish yo'q, klaviatura fokusi ko'rinadi.

## Chat ekrani qoidalari

1. **Bir vaqtda bitta savol.** Agent uzun ro'yxat tashlamaydi.
2. **Jarayon doim ko'rinadi.** Yuqorida: «7 ta hujjatdan 5 tasi tayyor». Bu bizning asosiy farqimiz: odam qancha qolganini ko'radi.
3. **Hujjatlar ro'yxati yonda.** Har biri uch holatda: tayyor (yashil), yetishmaydi (sariq), tekshirilmoqda.
4. **Tugmali javoblar.** Mumkin bo'lgan joyda yozish o'rniga tugma: «Ha», «Yo'q», «Bilmayman».
5. **Summalar tasdiqlanadi.** Agent pul miqdorini qayta ko'rsatadi: «120 000 000 so'm, to'g'rimi?»
6. **Oddiy til.** Bank atamasi chiqsa, darhol bir gapda tushuntiriladi.
7. **Va'da yo'q.** «Kredit olasiz» emas, «arizangiz tayyor».
8. Telefonda ham to'liq ishlaydi (tadbirkor telefondan kiradi).

## Qarash uchun namunalar

Suhbat orqali murakkab ishni bajaradigan mahsulotlar:
- Lemonade (sug'urta, «Maya» yordamchisi) — savol-javob bilan ariza
- Cleo — moliya haqida suhbat
- TurboTax — qadam-baqadam soliq hujjati, jarayon ko'rsatkichi
- Typeform — bir vaqtda bitta savol

Bularni jamoa o'zi ochib ko'rishi kerak: Pinterest va Dribbble'ni avtomatik ocha olmadik.
