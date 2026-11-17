# Yetak — dizayn tizimi

Asos: **shadcn/ui** (Radix + Tailwind). Pastdagi qiymatlar uning tokenlariga qo'yiladi.

## Belgi

`assets/yetak-mark.svg` (yorug' fon), `assets/yetak-mark-dark.svg` (qora fon).

Ma'nosi: kichik nuqta — tadbirkor. Yo'l — biz. Katta to'q sariq nuqta — maqsad (tayyor ariza).

- Belgi atrofida kamida belgi balandligining chorak qismicha bo'sh joy.
- Rangini o'zgartirmang, cho'zmang, soya qo'shmang.
- So'z belgisi: «Yetak», Bricolage Grotesque 700, harflar orasi −0.02em.

## Ranglar

| Token | Yorug' | Qora | Qayerda |
|---|---|---|---|
| `--background` | `#f7f5f2` | `#0f131c` | Sahifa foni |
| `--card` | `#ffffff` | `#181e2b` | Kartalar, agent xabari |
| `--foreground` | `#14213d` | `#eef1f7` | Matn, belgi |
| `--muted-foreground` | `#5d667a` | `#9ba6b9` | Ikkinchi darajali matn |
| `--border` | `#e2ddd5` | `#2a3344` | Chiziqlar |
| `--primary` | `#f26a1b` | `#ff8a45` | Asosiy tugma, jarayon, belgidagi nuqta |
| `--primary-soft` | `#fde9dc` | `#3a2416` | Foydalanuvchi xabari foni |
| `--success` | `#12805c` | `#5fd0a4` | Tayyor hujjat |
| `--warning` | `#9a6a00` | `#f0c15a` | Yetishmayotgan narsa |
| `--destructive` | `#b93a32` | `#ff8f86` | Xato |

Nega shu ranglar: yashil (Ipak Yo'li, Hamkorbank) va binafsha (Uzum) band, ko'k — banklarning odatiy rangi. To'q sariq iliq va «davom eting» degan ma'no beradi.

To'q sariq faqat bitta narsaga: keyingi qadam. Sahifada bir vaqtda bitta to'q sariq tugma.

## Shrift

- Sarlavha va so'z belgisi: **Bricolage Grotesque** 600–700
- Matn: **Golos Text** 400–600 (o'zbek lotin va kirill harflarini to'liq qo'llaydi)
- Raqamlar: `tabular-nums`
- O'lchamlar: 14 / 16 / 18 / 24 / 32 / 40

## Shakl

- Burchak: 8px (kichik), 12px (karta), to'liq dumaloq (tugmacha-teglar)
- Soya ishlatilmaydi, chiziq ishlatiladi
- Oraliqlar: 4 ning karralari

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
